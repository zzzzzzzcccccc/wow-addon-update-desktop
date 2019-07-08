const service = require('../service/AddonDetail/AddonDetail');

const controller = (e, paths) => {
  service(paths, data => {
    e.sender.send(`getAddonDetail`, data);
  })
};

module.exports = controller;
