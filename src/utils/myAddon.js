import {INSTALL_ADDONS, WOW_ADDONS_FILE_PATH_KEY} from "../conf/index";

const { fs, rimraf } = window;

export default {
  getAddonList() { // 获取缓存列表
    const installFilePath = localStorage.getItem(WOW_ADDONS_FILE_PATH_KEY);
    if (!installFilePath) {
      return []
    }
    const fileJson = `${installFilePath}/${INSTALL_ADDONS}`;
    if (!fs.existsSync(fileJson)) {
      return []
    }
    return JSON.parse(fs.readFileSync(fileJson).toString()) || []
  },
  setAddon(rowData) { // 写入缓存
    const installFilePath = localStorage.getItem(WOW_ADDONS_FILE_PATH_KEY);
    if (!installFilePath) {
      return;
    }
    const fileJson = `${installFilePath}/${INSTALL_ADDONS}`;

    if (!fs.existsSync(fileJson)) {
      fs.writeFileSync(fileJson, '[]')
    }

    let list = JSON.parse(fs.readFileSync(fileJson).toString());
    if (list.length === 0) {
      list.push(rowData);
    } else {
      const findIndex = (list.filter(addon => addon.path === rowData.path)).length;
      if (findIndex === 0) {
        list.push(rowData);
      } else {
        list.forEach(addon => {
          if (addon.path === rowData.path) {
            addon.folderList = rowData.folderList;
            addon.updateTimeStamp = rowData.updateTimeStamp;
          }
        });
      }
    }

    fs.writeFileSync(fileJson, JSON.stringify(list));
  },
  getCacheAddon(rowData) { // 获取某一个缓存
    const installFilePath = localStorage.getItem(WOW_ADDONS_FILE_PATH_KEY);
    if (!installFilePath) {
      return {};
    }
    const fileJson = `${installFilePath}/${INSTALL_ADDONS}`;
    if (fs.existsSync(fileJson)) {
      const list = JSON.parse(fs.readFileSync(fileJson).toString());
      const findObj = list.filter(addon => addon.path === rowData.path);
      return findObj.length === 0 ? {} : findObj[0]
    } else {
      return {}
    }
  },
  deleteAddon(rowData) { // 删除某一个我的插件
    if (!rowData || !rowData.path) {
      return;
    }
    const installFilePath = localStorage.getItem(WOW_ADDONS_FILE_PATH_KEY);
    const fileJson = `${installFilePath}/${INSTALL_ADDONS}`;
    let list = JSON.parse(fs.readFileSync(fileJson).toString());
    let findObj = list.filter(addon => addon.path === rowData.path)[0] || {};

    if (!findObj.folderList) {
      return;
    }

    findObj.folderList.forEach(entryName => {
      rimraf(`${installFilePath}/${entryName}`, err => {});
    });

    fs.writeFileSync(fileJson, JSON.stringify(list.filter(addon => addon.path !== rowData.path)));
  }
}
