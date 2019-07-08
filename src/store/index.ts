import {action, observable} from 'mobx'
import {IStore} from "../interface";
import {AJAX_TIME_OUT, TIME_OUT_KEY, WOW_ADDONS_FILE_PATH_KEY} from "../conf";
import myAddon from "../utils/myAddon";

let electron = window['electron'];

class Store implements IStore {

  @observable
  loading = false;

  @observable
  myAddonList = [];

  @observable
  optionDrawerVisible = false;

  @observable
  myAddonDrawerVisible = false;

  @observable
  searchDrawerVisible = false;

  @observable
  updateAddonList = [];

  @action
  setLoading = (loading=false) => this.loading = loading;

  @action
  setMyAddonList = (list: any = []) => this.myAddonList = list;

  @action
  setOptionDrawerVisible = (bool:boolean) => this.optionDrawerVisible = bool;

  @action
  setMyAddonDrawerVisible = (bool: boolean) => this.myAddonDrawerVisible = bool;

  @action
  setSearchDrawerVisible = (bool: boolean) => this.searchDrawerVisible = bool;

  @action
  setUpdateAddonList = (list: any = []) => this.updateAddonList = list;

  @action
  getAddonsList = (path:string, page?:number) : Promise<any> => {
    return new Promise((resolve) => {
      let timer = setTimeout(():void => {
        electron.ipcRenderer.removeListener('getBaseAddons', () => {});
        resolve(TIME_OUT_KEY)
      }, AJAX_TIME_OUT);

      electron.ipcRenderer.send('baseAddons', path, page);
      electron.ipcRenderer.on('getBaseAddons', (e:any, data:any) => {
        clearTimeout(timer);
        electron.ipcRenderer.removeListener('getBaseAddons', () => {});
        resolve(data)
      })
    })
  };

  @action
  getAddonDownUrl = (rowData: any = {}): Promise<any> => {
    const installFilePath = localStorage.getItem(WOW_ADDONS_FILE_PATH_KEY);
    return new Promise((resolve) => {
      let timer = setTimeout((): void => {
        electron.ipcRenderer.removeListener(`${rowData.path}-getDownAddonUrl`, () => {});
        resolve(TIME_OUT_KEY);
      }, AJAX_TIME_OUT);

      electron.ipcRenderer.send('downAddon', rowData, installFilePath);
      electron.ipcRenderer.on(`${rowData.path}-getDownAddonUrl`, (e:any, data:any) => {
        if (data) {
          resolve(data);
        }
        electron.ipcRenderer.removeListener(`${rowData.path}-getDownAddonUrl`, () => {});
        clearTimeout(timer);
      });
    })
  };

  @action
  searchAddons = (keyword:string | number, page: number): Promise<any> => {
    return new Promise((resolve) => {
      let timer = setTimeout(():void => {
        electron.ipcRenderer.removeListener(`getSearchAddons`, () => {});
        resolve(TIME_OUT_KEY);
      }, AJAX_TIME_OUT);

      electron.ipcRenderer.send('searchAddons', keyword, page);
      electron.ipcRenderer.on('getSearchAddons',(e:any, data: any) => {
        resolve(data);
        clearTimeout(timer);
        electron.ipcRenderer.removeListener(`getSearchAddons`, () => {});
      })
    })
  };

  @action
  getAddonDetail = (paths:string): Promise<any> => {
    return new Promise((resolve, reject) => {
      electron.ipcRenderer.send('addonDetail', paths);
      electron.ipcRenderer.on('getAddonDetail', (e: any, data: any) => {
        resolve(data)
      })
    })
  };

  @action
  checkUpdateMyAddon = (): Promise<any> => {
    return new Promise((resolve) => {
      const updateAddon: Array<any> = [];
      const cacheAddonList:Array<any> = myAddon.getAddonList();
      if (cacheAddonList.length ===  0) {
        resolve(updateAddon)
      }
      this.getAddonDetail(cacheAddonList.map(v => v.path).join(',')).then((data: any) => {
        if (data.length=== 0) {
          resolve(updateAddon)
        }
        cacheAddonList.forEach((cache:any) => {
          data.forEach((detail: any) => {
            if (cache.path === detail.path) {
              if (cache.updateTimeStamp && detail.updateTimeStamp && (cache.updateTimeStamp * 1 < detail.updateTimeStamp * 1)) {
                updateAddon.push(detail)
              }
            }
          })
        });
        resolve(updateAddon)
      });
    })
  };
}


export default {
  store: new Store()
}
