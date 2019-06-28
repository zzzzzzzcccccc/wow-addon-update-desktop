import React from 'react'
import { Divider, Icon, Button, List, Popconfirm } from 'antd'
import { inject, observer } from 'mobx-react'
import moment from 'moment'
import './index.less'
import {INSTALL_ADDONS, TIME_OUT_KEY, WOW_ADDONS_FILE_PATH_KEY} from "../../../conf";
import helper from '../../../helper/index'
import myAddon from '../../../utils/myAddon'

const {fs, request, AdmZip, rimraf} = window;
const DEFAULT_BTN_TXT = '安装';
const GET_LOAD_BTN_TXT = '获取下载地址...';
const LOAD_BTN_TXT = '下载中...';
const INSTALL_BTN_TXT = '安装中...';
const SUCCESS_BTN_TXT = '成功';
const TIME_OUT_BTN_TXT = '获取超时重试';
const IconItem = ({ type, txt }) => (
  <div>
    <Icon type={type} />
    <span style={{ paddingLeft: `6px` }}>{ txt }</span>
  </div>
);

@inject('store')
@observer
class AddonItem extends React.Component {
  static defaultProps = {
    rowData: null,
    renderType: 0, // 0外部渲染 1我的插件渲染,
    rowIndex: null,
    cacheAddonItem: {}, // 我的插件列表
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      btnTxt: DEFAULT_BTN_TXT
    };
  }

  handleDownAddon = async (rowData) => {
    if (!rowData || !rowData.path) {
      return;
    }
    const {downAddon, setAppDrawerVisible} = this.props.store;
    const installFilePath = localStorage.getItem(WOW_ADDONS_FILE_PATH_KEY);
    if (!installFilePath) {
      helper.W('请先选择wow插件根目录地址');
      setAppDrawerVisible(true);
      return;
    }
    if (this.state.loading) {
      return;
    }
    // 获取curse下载地址
    this.setState({ loading: true, btnTxt: GET_LOAD_BTN_TXT });
    const downloadUrl = await downAddon(rowData);

    if (!downloadUrl) {
      this.setState({ loading: false, btnTxt: DEFAULT_BTN_TXT });
      return;
    }

    if (downloadUrl === TIME_OUT_KEY) { // 请求超时
      this.setState({ loading: false, btnTxt: TIME_OUT_BTN_TXT });
    } else {
      this.download(downloadUrl, installFilePath, rowData);
    }
  };

  download = (downloadUrl, installFilePath, rowData) => { // 下载
    this.setState({ btnTxt: LOAD_BTN_TXT });
    let file = `${installFilePath}/${rowData.label}_${Date.now()}.zip`;
    let writeStream = fs.createWriteStream(file);
    request.get(downloadUrl).pipe(writeStream);
    // 开始下载
    writeStream.on('drain',  () => {
      // console.log(`${rowData.label}start: ${writeStream.bytesWritten}`);
    });
    // 下载成功
    writeStream.on('finish',  () => {
      const msg = `${rowData.label}下载成功`;
      Notification ? new Notification('下载通知', {body: msg}) : helper.S(msg);
      this.setState({ btnTxt: INSTALL_BTN_TXT });
      this.unzipAddon(file, installFilePath, (folderList) => {
        rimraf(file, err => {});
        this.downloadSuccessAction(folderList, rowData, installFilePath);
        // end
        this.setState({ loading: false, btnTxt: SUCCESS_BTN_TXT })
      });
    });
    // 下载失败
    writeStream.on('error', () => {
      fs.unlink(file);
      const msg = '下载插件失败请重试';
      this.setState({ loading: false });
      Notification ? new Notification('下载通知', {body: msg}) : helper.S(msg);
    })
  };

  unzipAddon = (file, installFilePath, callback) => { // 解压下载完成的插件
    const zip = new AdmZip(file);
    const folderList = [];
    zip.getEntries().forEach(entry => {
      const entryName = entry.entryName;
      const folderName = entryName.split('/')[0];
      if (folderList.indexOf(folderName) === -1) {
        folderList.push(folderName);
      }
    });
    // 执行解压
    zip.extractAllTo(installFilePath, true);
    callback(folderList);
  };

  downloadSuccessAction = (folderList, rowData, installFilePath) => { // 下载成功保存一下插件信息
    const fileJson = `${installFilePath}/${INSTALL_ADDONS}`;
    if (!fs.existsSync(fileJson)) {
      fs.writeFileSync(fileJson, '[]')
    }
    const item = JSON.parse(JSON.stringify(rowData));
    item.folderList = folderList;
    // 同步本地插件列表
    myAddon.setAddon(item);

    if (this.props.onSuccess) {
      this.props.onSuccess(rowData);
    }

    if (this.props.myAddonDrawerInfo) {
      this.props.myAddonDrawerInfo.getDataList();
    }
  };

  deleteAddon = (rowData) => {
    myAddon.deleteAddon(rowData);
    helper.S();

    if (this.props.onDelete) {
      this.props.onDelete(rowData)
    }
  };

  renderAction = (rowData) => {
    if (!rowData) {
      return null;
    }

    const { loading, btnTxt } = this.state;
    const { cacheAddonItem } = this.props;
    const { updateTimeStamp } = rowData;
    const { updateTimeStamp: cacheUpdateTimeStamp } = cacheAddonItem;

    let isInstall = !!cacheUpdateTimeStamp; // 是否已安装
    let disabled = false; // 是否需要更新

    if (isInstall) {
      disabled = updateTimeStamp * 1 <= cacheUpdateTimeStamp * 1;
    }

    return[
      isInstall && disabled ? <Button disabled size="small" type="primary" key={`${rowData.path}-install`}>已安装</Button> :
        <Popconfirm onConfirm={() => this.handleDownAddon(rowData)} title="确认执行吗" placement="left" key={`${rowData.path}-install`}>
          <Button size="small" type="primary" loading={loading} disabled={disabled}>{
            !loading ? (isInstall ? (disabled ? '已安装' : '有更新') : '安装') : btnTxt
          }</Button>
        </Popconfirm>
    ]
  };

  renderMyAction = (rowData) => {
    const { loading, btnTxt } = this.state;
    return[
      loading ? <Button size="small" type="primary" key={`${rowData.path}-installBtn`} loading={loading}>{btnTxt}</Button> :
        <Popconfirm key={`${rowData.path}-installBtn`} title="确认执行吗" onConfirm={() => this.handleDownAddon(rowData)} placement="left">
          <Button size="small" type="primary">更新</Button>
        </Popconfirm>,
      <Divider type="vertical" key={`${rowData.path}-line`} />,
      <Popconfirm key={`${rowData.path}-deleteBtn`} onConfirm={() => this.deleteAddon(rowData)} title="确认执行吗" placement="left">
        <Button size="small" type="danger">删除</Button>
      </Popconfirm>
    ]
  };

  render() {
    const { rowData, renderType } = this.props;
    if (!rowData) {
      return null
    }
    const {thumb, label, description, downloadCount, createTimeStamp, updateTimeStamp} = rowData;
    return(
      <List.Item style={{ padding: 0 }}>
        <div className="addon-item-wrapper">
          <img src={thumb ? thumb : `https://media.forgecdn.net/avatars/thumbnails/54/513/64/64/636135265289061589.png  `} alt={label} className="addon-item-wrapper-thumb" />
          <div className="addon-item-wrapper-label">
            <header className="addon-item-wrapper-label-header">{label}</header>
            <section className="addon-item-wrapper-label-total">
              <IconItem type="download" txt={`${downloadCount}`} />
              <Divider type="vertical" />
              <IconItem type="reload" txt={`${isNaN(updateTimeStamp * 1000) ? '' : moment(new Date(updateTimeStamp * 1000)).fromNow()}更新`} />
              <Divider type="vertical" />
              <IconItem type="calendar" txt={`${isNaN(createTimeStamp * 1000) ? '' : moment(new Date(createTimeStamp * 1000)).fromNow()}创建`} />
            </section>
            <p className="addon-item-wrapper-label-txt" title={description ? description : 'no description'}>{description ? description : 'no description'}</p>
          </div>
          <div className="addon-item-wrapper-label-actions">
            {!renderType ? this.renderAction(rowData) : this.renderMyAction(rowData)}
          </div>
        </div>
      </List.Item>
    )
  }
}

export default AddonItem
