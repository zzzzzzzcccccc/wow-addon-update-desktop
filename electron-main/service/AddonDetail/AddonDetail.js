const config = require('../../conf/index');
const request = require('superagent');
const cheerio = require('cheerio');
const EventProxy = require('eventproxy');

require('superagent-charset')(request);

/**
 * 获取根据路由地址获取从插件详细信息
 * @param paths    逗号隔开的路由地址支持多个查询
 * @param callback 回调函数
 */
const service = (paths, callback) => {
  if (!paths) {
    callback([]);
    return;
  }

  const ep = new EventProxy();
  const pathArr = paths.split(',');
  const list = [];

  ep.after('getDetail', pathArr.length, () => {
    callback(list);
  });


  for (let i = 0; i < pathArr.length; i++) {
    let addonsDetailUrl = `${config.addonsBaseUrl}${pathArr[i]}`;
    request.get(addonsDetailUrl).buffer(true).end((err, res) => {
      if (!err) {
        const $ = cheerio.load(res.text);
        list.push(findAddonDetail($, pathArr[i]));
        ep.emit('getDetail', '');
      } else {
        ep.emit('getDetail', '')
      }
    })
  }
};

const findAddonDetail = ($, path) => {
  const commonNode = $('body > div > main > div.z-0 > header > div.container > div:nth-child(1)');

  return {
    thumb: commonNode.find('figure > div > a > img').attr('src') || '',
    path,
    label: commonNode.find('div > div:nth-child(1) > h2').text() || '',
    downloadCount: commonNode.find('div > div:nth-child(3) > span:nth-child(1)').text() || '',
    updateTimeStamp: commonNode.find('div > div:nth-child(3) > span:nth-child(2) > abbr').attr('data-epoch') || 0,
    createTimeStamp: 0,
    description: ''
  }
};

module.exports = service;
