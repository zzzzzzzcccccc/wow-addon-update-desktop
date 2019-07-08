import React, {Fragment} from 'react'
import { AddonItemProps, AddonItemState } from './index'
import { Divider, Button, Popconfirm, message } from 'antd'
import styles from './index.module.less'
import { IconItem } from '../../../components'
import moment from 'moment'
import { inject, observer } from 'mobx-react'
import {INSTALL_ADDONS, TIME_OUT_KEY, WOW_ADDONS_FILE_PATH_KEY} from "../../../conf";
import myAddon from "../../../utils/myAddon";

const DEFAULT_THUMB:string = 'https://media.forgecdn.net/avatars/thumbnails/54/513/64/64/636135265289061589.png';
const DEFAULT_BTN_TXT:string = '安装';
const GET_LOAD_BTN_TXT:string = '获取下载地址...';
const LOAD_BTN_TXT:string = '下载插件中...';
const INSTALL_BTN_TXT:string = '安装插件中...';
const SUCCESS_BTN_TXT:string = '成功';
const GET_DOWN_URL_TIME_OUT:string = '获取下载地址超时重试';
const fs = window['fs'];
const request = window['request'];
const AdmZip = window['AdmZip'];
const rimraf = window['rimraf'];

@inject('store')
@observer
class AddonItem extends React.Component<AddonItemProps, AddonItemState> {
  static defaultProps = {
    rowData: null
  };

  constructor(props:AddonItemProps) {
    super(props);

    this.state = {
      loading: false,
      btnTxt: DEFAULT_BTN_TXT,
      installFilePath: localStorage.getItem(WOW_ADDONS_FILE_PATH_KEY) ? localStorage.getItem(WOW_ADDONS_FILE_PATH_KEY) : '',
      downloadUrl: '',
      zipFile: ''
    }
  }

  handleDownAddon = async (rowData: any): Promise<any> => {
    if (!rowData || !rowData.path) {
      return;
    }
    const {setOptionDrawerVisible, getAddonDownUrl} = this.props.store!;
    if (!this.state.installFilePath) {
      message.warning('请先选择wow插件根目录地址');
      setOptionDrawerVisible(true);
      return;
    }
    if (this.state.loading) {
      return;
    }
    if (this.state.zipFile) {
      rimraf(this.state.zipFile, () => {})
    }
    if (!this.state.downloadUrl) {
      this.setState({ loading: true, btnTxt: GET_LOAD_BTN_TXT });
      const downloadUrl = await getAddonDownUrl(rowData);
      if (downloadUrl === TIME_OUT_KEY || !downloadUrl) {
        this.setState({ loading: false, btnTxt: GET_DOWN_URL_TIME_OUT });
        return;
      }
      this.setState({ downloadUrl }, () => this.handleDownloading(downloadUrl, rowData));
    } else { // 有历史下载地址就直接去下载
      this.handleDownloading(this.state.downloadUrl, rowData)
    }
  };

  handleDownloading = (downloadUrl: string, rowData: any): void => { // 下载插件
    let file = `${this.state.installFilePath}/${rowData.label}_${Date.now()}.zip`;
    let writeStream = fs.createWriteStream(file);

    this.setState({ loading: true, btnTxt: LOAD_BTN_TXT, zipFile: file });

    request.get(downloadUrl).pipe(writeStream);

    // 开始下载
    writeStream.on('drain', () : void => {});
    // 下载成功
    writeStream.on('finish', (): void => {
      this.setState({ btnTxt: INSTALL_BTN_TXT });
      this.unzipAddon().then((folderList: Array<any>): void => {
        this.handleInstallDown(folderList, rowData);
      })
    });
    // 下载失败
    writeStream.on('error', ():void => {
      rimraf(file, () => {});
      this.setState({ loading: false, btnTxt: `下载插件失败重试` });
    })
  };

  unzipAddon = (): Promise<any> => { // 解压插件zip包
    return new Promise((resolve) => {
      const zip = new AdmZip(this.state.zipFile);
      const folderList: Array<any> = [];
      zip.getEntries().forEach((entry:any) => {
        const entryName = entry.entryName;
        const folderName = entryName.split('/')[0];
        if (folderList.indexOf(folderName) === -1) {
          folderList.push(folderName);
        }
      });
      // 执行解压
      zip.extractAllTo(this.state.installFilePath, true);
      resolve(folderList)
    })
  };

  handleInstallDown = (folderList:Array<any>, rowData:any): void => {
    const fileJson = `${this.state.installFilePath}/${INSTALL_ADDONS}`;
    const { setMyAddonList, updateAddonList, setUpdateAddonList } = this.props.store!;
    if (!fs.existsSync(fileJson)) {
      fs.writeFileSync(fileJson, '[]')
    }
    const item = JSON.parse(JSON.stringify(rowData));
    item.folderList = folderList;
    // 同步本地插件列表
    myAddon.setAddon(item);
    // 重新获取一次安装插件列表
    setMyAddonList(myAddon.getAddonList());
    // 删除zip包
    rimraf(this.state.zipFile, () => {});
    // 若安装的插件在需要更新的列表里存在则删除掉
    let cacheUpdateAddonList = JSON.parse(JSON.stringify(updateAddonList));
    if (cacheUpdateAddonList.filter((v:any) => v.path === rowData.path).length !== 0) {
      setUpdateAddonList(cacheUpdateAddonList.filter((v:any) => v.path !== rowData.path))
    }
    this.setState({ btnTxt: SUCCESS_BTN_TXT, loading: false });
  };

  deleteAddon = (rowData:any): void => { // 删除插件
    myAddon.deleteAddon(rowData);
    message.success('插件已删除');
    // 删除掉重新同步一次已安装的插件
    this.props.store!.setMyAddonList(myAddon.getAddonList());
  };

  renderActions = (rowData: any): React.ReactNode => {
    const { loading, btnTxt } = this.state;
    const myAddonList: Array<any> = JSON.parse(JSON.stringify(this.props.store!.myAddonList));
    const findArr: Array<any> =  myAddonList.filter((addon:any) => addon.path === rowData.path);
    const cacheAddonItem:any = findArr.length === 0 ? {} : findArr[0];

    const { updateTimeStamp: cacheUpdateTimeStamp } = cacheAddonItem;
    const { updateTimeStamp } = rowData;

    let isInstall: boolean = !!cacheUpdateTimeStamp; // 是否已安装
    let disabled: boolean = false; // 是否需要更新

    if (isInstall) {
      disabled = updateTimeStamp * 1 <= cacheUpdateTimeStamp * 1;
    }

    return(
      <div className={styles.actions}>
        {isInstall && disabled ?
          <Button disabled size="small" type="primary" key={`${rowData.path}-install`}>已安装</Button> :
          <Popconfirm onConfirm={() => this.handleDownAddon(rowData)} placement="left" title="确认执行吗?" key={`${rowData.path}-install`}>
            <Button size="small" type="primary" loading={loading} disabled={disabled}>
              {!loading ? (isInstall ? (disabled ? '已安装' : '有更新') : '安装') : btnTxt}
            </Button>
          </Popconfirm>
        }
        {!isInstall ? null :
          <Fragment>
            <Divider type="vertical" key={`${rowData.path}-line`} />
            <Popconfirm key={`${rowData.path}-deleteBtn`} onConfirm={() => this.deleteAddon(rowData)} title="确认执行吗" placement="left">
              <Button size="small" type="danger">删除</Button>
            </Popconfirm>
          </Fragment>
        }
      </div>
    );
  };

  render() {
    const { rowData } = this.props;
    let updateAddonList = JSON.parse(JSON.stringify(this.props.store!.updateAddonList));
    if (!rowData) {
      return null;
    }
    let nowRowData:any = JSON.parse(JSON.stringify(rowData));
    const findUpdateAddonArr = updateAddonList.filter((v: any) => v.path === rowData.path);
    if (findUpdateAddonArr.length !== 0) {
      if (findUpdateAddonArr[0].updateTimeStamp) {
        nowRowData.updateTimeStamp = findUpdateAddonArr[0].updateTimeStamp
      }
    }
    const {thumb, label, description, downloadCount, createTimeStamp, updateTimeStamp} = nowRowData;
    return(
      <section className={styles.section}>
        <div className={styles.itemWrapper}>
          <img src={thumb ? thumb : DEFAULT_THUMB} alt={label} className={styles.thumbImg} />
          <div className={styles.itemLabel}>
            <header className={styles.title}>{label}</header>
            <section className={styles.label}>
              <IconItem type="download" txt={downloadCount} />
              <Divider type="vertical" />
              <IconItem type="reload" txt={`${isNaN(updateTimeStamp * 1000) ? '' : moment(new Date(updateTimeStamp * 1000)).fromNow()}更新`} />
              <Divider type="vertical" />
              <IconItem type="calendar" txt={`${isNaN(createTimeStamp * 1000) ? '' : moment(new Date(createTimeStamp * 1000)).fromNow()}创建`} />
            </section>
            <p className={styles.desc} title={description}>{description}</p>
          </div>
          <div className={styles.actions}>
            {this.renderActions(nowRowData)}
          </div>
        </div>
      </section>
    )
  }
}

export default AddonItem
