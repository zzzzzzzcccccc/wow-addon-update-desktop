const service = require('../service/BaseAddons/BaseAddons.js');

const controller = (e, path, page) => {
  service(path ? path : '/wow/addons', page ? page : 1, data => {
    console.log(data, '插件数据发送成功')
    e.sender.send('getBaseAddons', data)
  })
};

module.exports = controller;
