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
    const total = getSearchCount($) ? getSearchCount($) : 0;
    const pageSize = 20;
    callback({total: total ? (isNaN(total * 1) ? 0 : total * 1) : 0, page, list: total ? getAddonList($) || [] : [], pageSize})
  })
};

/*
* 获取查询总数
* */
const getSearchCount = ($) => {
  const dom = $('#content > section.primary-content > div.search-container > div.tabbed-container > div.scroll-container > div.scrolled-content > div.j-tab-search > ul > li > a');

  return dom.text() ? dom.text().replace(/[^0-9]+/g, '') : 0
};

/*
* 获取插件的列表
* */
const getAddonList = ($) => {
  const list = [];
  const dom = $(`#tab-addons > div.listing-container > div.listing-body > ul > li.project-list-item`);

  dom.each((i, el) => {
    let leftDom = $(el).find('div > div.list-item__avatar > a.avatar__container');
    let centerDom = $(el).find('div > div.list-item__details');
    list.push({
      thumb: leftDom.find('figure > img.aspect__fill').attr('src') || '',
      path: leftDom.attr('href') || '',
      lastPath: leftDom.attr('href').split('/')[leftDom.attr('href').split('/').length - 1] || '',
      label: centerDom.find('a > h2.list-item__title').text().replace(/[ \r\n]/g,"") || '',
      downloadCount: centerDom.find('p.list-item__stats > span.count--download').text() || '',
      updateTime: centerDom.find('p.list-item__stats > span.date--updated > abbr').attr('title') || '',
      updateTimeStamp: centerDom.find('p.list-item__stats > span.date--updated > abbr').attr('data-epoch') || '',
      createTimeStamp: centerDom.find('p.list-item__stats > span.date--created > abbr').attr('data-epoch') || '',
      description: centerDom.find('div.list-item__description > p').attr('title') || ''
    })
  });

  return list;
};

module.exports = service;
