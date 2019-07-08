import React from 'react'
import {IStore} from "../../../interface";
import { inject, observer } from 'mobx-react'
import styles from './index.module.less'
import {IMenuList, menuList} from '../../../conf/menuList'
import { TabTitle, TabItem } from '../../common'
import { Tabs, Drawer, Upload, Button, message, Tooltip } from 'antd'
import myAddon from '../../../utils/myAddon'
import {WOW_ADDONS_FILE_PATH_KEY} from "../../../conf";
import { MyAddon, SearchAddon } from '../../common'

const SESSION_CURRENT_INDEX_KEY:string = '__SESSION_CURRENT_INDEX__';
const TAB_HEIGHT:number = 46 + 16; // tab标题高低46 下边距 16

interface HomeProps {
  store?: IStore;
}

interface HomeState {
  currentIndex: any;
  tabHeight: number;
}

@inject('store')
@observer
class Home extends React.Component<HomeProps, HomeState> {
  constructor(props: HomeProps) {
    super(props);

    let currentIndex = localStorage.getItem(SESSION_CURRENT_INDEX_KEY) ? localStorage.getItem(SESSION_CURRENT_INDEX_KEY) : '0';

    this.state = {
      currentIndex,
      tabHeight: document.documentElement.clientHeight - TAB_HEIGHT
    }
  }

  handleTabChange = (currentIndex: any): void => this.setState({ currentIndex }, (): void => localStorage.setItem(SESSION_CURRENT_INDEX_KEY, currentIndex));

  windowSizeChange = (): void => {
    window.onresize = (): void => this.setState({ tabHeight: document.documentElement.clientHeight - TAB_HEIGHT })
  };

  getInstallFilePath = (e:any): void => {
    const { setOptionDrawerVisible, setMyAddonList } = this.props.store!;
    const { file } = e;
    if (file && file.path) {
      localStorage.setItem(WOW_ADDONS_FILE_PATH_KEY, file.path);
      message.success('设置wow根目录插件成功');
      setOptionDrawerVisible(false);
      setMyAddonList(myAddon.getAddonList())
    }
  };

  checkUpdate = (): void => { // 检查更新
    const cacheAddonList:Array<any> = myAddon.getAddonList();
    const { setMyAddonList, checkUpdateMyAddon, setUpdateAddonList, setMyAddonDrawerVisible } = this.props.store!;

    setMyAddonList(cacheAddonList);

    checkUpdateMyAddon().then(data => {
      setUpdateAddonList(data);
      if (data.length !== 0) {
        message.info(`你有${data.length}个插件需要更新`);
        setMyAddonDrawerVisible(true);
      }
    })
  };

  componentDidMount() {
    this.windowSizeChange();
    this.checkUpdate()
  }

  render() {
    const { currentIndex, tabHeight } = this.state;
    const { optionDrawerVisible, setOptionDrawerVisible, myAddonDrawerVisible, setMyAddonDrawerVisible, searchDrawerVisible, setSearchDrawerVisible, checkUpdateMyAddon, setUpdateAddonList } = this.props.store!;
    return(
      <div className={styles.homeApp}>
        <section className={styles.tabWrapper}>
          <Tabs onChange={this.handleTabChange} activeKey={currentIndex}>
            {menuList.map((item:IMenuList, index:number) => {
              return(
                <Tabs.TabPane key={index + ''} tab={<TabTitle item={item} />}>
                  <section className={styles.tabItemWrapper} style={{ height: tabHeight + 'px' }}>
                    <TabItem path={item.path} addonLabel={item.label} />
                  </section>
                </Tabs.TabPane>
              )
            })}
          </Tabs>
        </section>

        <section className={styles.menuWrapper}>
          <div className={styles.menuWrapperInfo}>
            <Tooltip title="我的插件">
              <Button type="primary" icon="file-protect" shape="circle" onClick={():void => {
                const installFilePath = localStorage.getItem(WOW_ADDONS_FILE_PATH_KEY);
                if (!installFilePath) {
                  message.warning(`请先选择wow插件根目录地址`);
                  setOptionDrawerVisible(true);
                  return;
                };
                checkUpdateMyAddon().then((data:any) => setUpdateAddonList(data));
                setMyAddonDrawerVisible(true);
              }} />
            </Tooltip>
            <Tooltip title="插件搜索">
              <Button type="primary" icon="search" shape="circle" onClick={() => setSearchDrawerVisible(true)} />
            </Tooltip>
            <Tooltip title="设置">
              <Button type="primary" icon="radius-setting" shape="circle" onClick={() => setOptionDrawerVisible(true)} />
            </Tooltip>
          </div>
        </section>

        <Drawer title="设置" visible={optionDrawerVisible}
                onClose={() => setOptionDrawerVisible(false)}
                destroyOnClose
                width="100%">
          <Upload customRequest={(e:any) => this.getInstallFilePath(e)}
                  directory
                  fileList={undefined}>
            <Button type="primary">{localStorage.getItem(WOW_ADDONS_FILE_PATH_KEY) ? `当前目录:${localStorage.getItem(WOW_ADDONS_FILE_PATH_KEY)}` : 'wow插件根目录地址(如:/a/b/Interface/AddOns)'}</Button>
          </Upload>
        </Drawer>

        <Drawer title="我的插件" visible={myAddonDrawerVisible}
                width="100%"
                onClose={() => setMyAddonDrawerVisible(false)}>
          <MyAddon />
        </Drawer>

        <Drawer title="插件搜索" visible={searchDrawerVisible}
                width="100%"
                onClose={() => setSearchDrawerVisible(false)}>
          <SearchAddon />
        </Drawer>
      </div>
    )
  }
}

export default Home
