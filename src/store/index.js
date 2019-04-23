import React from 'react'
import { observable, action } from 'mobx'
import {AJAX_TIME_OUT, TIME_OUT_KEY, WOW_ADDONS_FILE_PATH_KEY} from "../conf";
import { notification, Button, Icon } from 'antd'

const electron = window.electron;
const reloadNotice = (message, description) => {
  let key = `open${Date.now()}`;

  const reloadAction = () => {
    notification.close(key);
    electron.ipcRenderer.send('reloadWindow')
  };

  notification.open({
    message: (
      <span>
        <Icon type="close-circle" style={{ color: '#f50', marginRight: '6px' }} />
        {message}
      </span>
    ),
    description,
    key,
    btn: (
      <Button type="primary" size="small" onClick={() => reloadAction()}>
        Confirm
      </Button>
    ),
    onClose: () => reloadAction(),
    duration: null
  })
};

class Store {
  @observable
  loading = false;

  @observable
  appDrawerVisible = false;

  @observable
  myAddonDrawerVisible = false;

  @action
  setLoading = data => this.loading = data || false;

  @action
  setAppDrawerVisible = data => this.appDrawerVisible = data || false;

  @action
  setMyAddonDrawerVisible = data => this.myAddonDrawerVisible = data || false;

  @action
  getAddonsList = (path, page) => {
    if (this.loading) {
      return;
    }
    this.setLoading(true);
    return new Promise((resolve, reject) => {
      let timer = setTimeout(() => {
        this.setLoading(false);
        electron.ipcRenderer.removeListener('getBaseAddons', () => {});
        reject(TIME_OUT_KEY);
        reloadNotice('获取插件列表失败', '重新获取curse插件列表')
      }, AJAX_TIME_OUT);


      electron.ipcRenderer.send('baseAddons', path, page);
      electron.ipcRenderer.on('getBaseAddons', (e, data) => {
        this.setLoading(false);
        resolve(data || {});
        electron.ipcRenderer.removeListener('getBaseAddons', () => {});
        clearTimeout(timer);
      });
    })
  };

  @action
  downAddon = (rowData) => {
    const installFilePath = localStorage.getItem(WOW_ADDONS_FILE_PATH_KEY);

    return new Promise((resolve, reject) => {
      let timer = setTimeout(() => {
        electron.ipcRenderer.removeListener(`${rowData.path}-getDownAddonUrl`, () => {});
        reject(TIME_OUT_KEY);
        reloadNotice('获取插件下载地址失败', '重新获取curse插件列表')
      }, AJAX_TIME_OUT);

      electron.ipcRenderer.send('downAddon', rowData, installFilePath);
      electron.ipcRenderer.on(`${rowData.path}-getDownAddonUrl`, (e, data) => {
        if (data) {
          resolve(data);
        } else {
          electron.ipcRenderer.removeListener(`${rowData.path}-getDownAddonUrl`, () => {});
          reject();
        }
        clearTimeout(timer);
      });
    })
  };
}

export default new Store();
