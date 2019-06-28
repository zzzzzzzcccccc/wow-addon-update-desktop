const config = require('../../conf/index');
const request = require('superagent');
const cheerio = require('cheerio');

require('superagent-charset')(request);

/*
* @param  {object}   e                 主进程的event
* @param  {string}   keyword           搜索的关键词
* @param  {number}   page              页码
* @return            callback
* */
const service = (keyword, page, callback) => {
  const searchUrl = `${config.addonsBaseUrl}/wow/addons/search?search=${keyword}&wow-addons-page=${page}`;

  // 执行搜索爬取
  request.get(searchUrl).buffer(true).charset('utf-8').end((err, res) => {
    if (err) {
      callback({total: 0, page, list: [], pageSize: 20});
      return;
    }
    const $ = cheerio.load(res.text);
    const list = getAddonList($);
    const pageSize = 20;
    callback({
      total: list.length,
      page,
      pageSize,
      list
    })
  })
};

/*
* 获取插件的列表
* */
const getAddonList = ($) => {
  const list = [];
  const dom = $(`body > div.flex.flex-col.min-h-full.min-h-screen > main > div.container.mx-auto.mt-6.flex.flex-col.flex-1 > div:nth-child(4) > ul > div > div.my-2`);

  dom.each((i, el) => {
    let dom = $(el).find('div.project-listing-row');
    list.push({
      thumb: dom.find('div:nth-child(1) > div:nth-child(1) > div.project-avatar > a > img').attr('src') || '',
      path: dom.find('div:nth-child(1) > div:nth-child(1) > div.project-avatar > a').attr('href') || '',
      label: dom.find('div:nth-child(2) > div:nth-child(1) > a:nth-child(1) > h3').text() || '',
      downloadCount: dom.find('div:nth-child(2) > div:nth-child(2) > span:nth-child(1)').text() || '',
      updateTimeStamp: dom.find('div:nth-child(2) > div:nth-child(2) > span:nth-child(2) > abbr').attr('data-epoch') || 0,
      createTimeStamp: dom.find('div:nth-child(2) > div:nth-child(2) > span:nth-child(3) > abbr').attr('data-epoch') || 0,
      description: dom.find('div:nth-child(2) > p').text() || ''
    })
  });

  return list;
};

module.exports = service;
