import React from 'react'
import { observer, inject } from 'mobx-react'
import '../../assets/style/common/item.less'
import { Tabs, Spin, Drawer, Upload, Icon, Button } from 'antd'
import TabItem from './TabItem'
import {debounce} from "../../utils";
import './index.less'
import menuList from '../../conf/menuList'
import {WOW_ADDONS_FILE_PATH_KEY} from "../../conf";
import helper from "../../helper";
import { FloatButton } from '../../components'
import MyAddonDrawerInfo from './MyAddonDrawerInfo/MyAddonDrawerInfo'
import SearchAddonDrawerInfo from './SearchAddonDrawerInfo/SearchAddonDrawerInfo'

const TabPane = Tabs.TabPane;
const TAB_HEIGHT = 46 + 16; // tab标题高低46 下边距 16
const SESSION_CURRENT_INDEX_KEY = '__SESSION_CURRENT_INDEX__';

@inject('store')
@observer
class Home extends React.Component {
  constructor(props) {
    super(props);

    let currentIndex = localStorage.getItem(SESSION_CURRENT_INDEX_KEY) ? localStorage.getItem(SESSION_CURRENT_INDEX_KEY) : '0';

    this.state = {
      tabHeight: document.documentElement.clientHeight - TAB_HEIGHT,
      currentIndex
    };
  }

  getInstallFilePath = (e) => {
    const { setAppDrawerVisible } = this.props.store;
    const { file } = e;
    if (file && file.path) {
      localStorage.setItem(WOW_ADDONS_FILE_PATH_KEY, file.path);
      helper.S('设置wow根目录插件成功');
      setAppDrawerVisible(false);
    }
  };

  componentDidMount() {
    window.onresize = debounce(() => this.setState({ tabHeight: document.documentElement.clientHeight - TAB_HEIGHT }), 1000);
  }

  renderTabTitle = (item) => {
    return(
      <div>
        <img src={item.thumb} alt={item.label} style={{ width: '20px', height: '20px', marginRight: '6px' }} />
        <span>{item.label || ''}</span>
      </div>
    )
  };

  render() {
    const { loading, appDrawerVisible, setAppDrawerVisible, myAddonDrawerVisible, setMyAddonDrawerVisible, searchDrawerVisible, setSearchDrawerVisible } = this.props.store;
    const { tabHeight, currentIndex } = this.state;
    return(
      <div className="root-wrapper home-wrapper">
        <FloatButton btnList={[
          {comp: <Icon type="file-protect" onClick={() => {
              const installFilePath = localStorage.getItem(WOW_ADDONS_FILE_PATH_KEY);
              if (!installFilePath) {
                helper.W(`请先选择wow插件根目录地址`);
                setAppDrawerVisible(true);
                return;
              }
              setMyAddonDrawerVisible(true);
            }} />, title: '我的插件'},
          {comp: <Icon type="radius-setting" onClick={() => setAppDrawerVisible(true)} />, title: '设置'},
          {comp: <Icon type="search" onClick={() => setSearchDrawerVisible(true)} />, title: '插件搜索'}
          ]} />

        <section className="home-wrapper-container">
          <Spin spinning={loading}>
            <Tabs onChange={currentIndex => {
              localStorage.setItem(SESSION_CURRENT_INDEX_KEY, currentIndex);
              this.setState({ currentIndex });
            }} activeKey={currentIndex}>
              {menuList.map((item, index) => {
                return(
                  <TabPane key={index} tab={this.renderTabTitle(item)}>
                    <section style={{ height: `${tabHeight}px`, overflowY: 'auto', backgroundColor: '#fff', overflowX: 'hidden' }}>
                      <TabItem ref={el => this.tabItem = el} path={item.path} myAddonDrawerInfo={this.myAddonDrawerInfo} />
                    </section>
                  </TabPane>
                )
              })}
            </Tabs>
          </Spin>
        </section>

        <Drawer visible={appDrawerVisible}
                onClose={() => setAppDrawerVisible(false)}
                width="100%"
                destroyOnClose
                title="设置">
          <Upload customRequest={this.getInstallFilePath} fileList={false} webkitdirectory directory>
            <Button type="primary">{localStorage.getItem(WOW_ADDONS_FILE_PATH_KEY) ? `当前目录:${localStorage.getItem(WOW_ADDONS_FILE_PATH_KEY)}` : 'wow插件根目录地址(如:/a/b/Interface/AddOns)'}</Button>
          </Upload>
        </Drawer>

        <Drawer visible={myAddonDrawerVisible}
                placement="left"
                width="100%"
                title="我的插件"
                onClose={() => setMyAddonDrawerVisible(false)}>
          <MyAddonDrawerInfo ref={el => this.myAddonDrawerInfo = el} onDelete={() => {
            this.tabItem.wrappedInstance.setCacheAddonList();
            if (this.searchAddonDrawerInfo && this.searchAddonDrawerInfo.wrappedInstance) {
              this.searchAddonDrawerInfo.wrappedInstance.setCacheAddonList();
            }
          }} />
        </Drawer>

        <Drawer  placement="right"
                 width="100%"
                 visible={searchDrawerVisible}
                 onClose={() => setSearchDrawerVisible(false)}
                 title="搜索">
          <SearchAddonDrawerInfo myAddonDrawerInfo={this.myAddonDrawerInfo} ref={el => this.searchAddonDrawerInfo = el} />
        </Drawer>
      </div>
    )
  }
}

export default Home
