const service = require('../service/SearchAddons/SearchAddons');

const controller = (e, keyword, page) => {
  service(keyword, page ? page : 1, data => {
    e.sender.send('getSearchAddons', data)
  })
};

module.exports = controller;
