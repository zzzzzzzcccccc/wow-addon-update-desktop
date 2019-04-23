const service = require('../service/DownAddon/DownAddon');

const controller = (e, rowData) => {
  service(e, rowData, data => {
    e.sender.send(`${rowData.path}-getDownAddonUrl`, data);
  })
};

module.exports = controller;
