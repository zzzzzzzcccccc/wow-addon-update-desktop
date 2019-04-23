const config = require('../../conf/index');
const request = require('superagent');
const cheerio = require('cheerio');

require('superagent-charset')(request);

/**
* @params {string}   menu
* @params {number}   path
* @return {function} callback
* */
const service = (path, page, callback) => {
  const addonsBaseUrl = `${config.addonsBaseUrl}${path}?page=${page}`;

  request.get(addonsBaseUrl).buffer(true).charset('utf-8').end((err, res) => {
    if (err) {
      callback(err);
      return
    }
    const $ = cheerio.load(res.text);
    // console.log('已访问到curese页面', addonsBaseUrl);
    const addonsList = findAddonsList($);
    const maxPage = findAddonsMaxPageNum($);
    const size = 20;
    callback({
      // menuList: findMenuList($),
      addonsList,
      page: parseInt(page),
      size,
      total: maxPage * size,
      maxPage
    });
  })
};

// 获取cures 左侧目录
const findMenuList = ($) => {
  let list = [];
  const commonDom = $('#content > section > div > main > aside > div > div.category--listings > section > div > div > ul');
  list.push({
    label: commonDom.find('li.category__item').attr('data-category'),
    path: null,
    lastPath: null,
    thumb: commonDom.find('li.category__item > a > div > div > figure > img').attr('src')
  });
  commonDom.find('li.tier-holder > ul > li.category__item').each((i, el) => {
    const path = $(el).find('a').attr('href');
    list.push({
      label: $(el).attr('data-category') || '',
      path: path || '',
      lastPath: path.split('/')[path.split('/').length - 1] || '',
      thumb: $(el).find('a > div > div > figure > img').attr('src') || ''
    })
  });

  return list
};

// 获取cures 插件列表
const findAddonsList = ($) => {
  const list = [];

  $('#content > section > div > main > section > section > div > div.listing-body > ul > li.project-list-item').each((i, el) => {
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

// 获取curse的最大页码
const findAddonsMaxPageNum = ($) => {
  const lastDom = $('#content > section > div > main > section > section > div > div.listing-header > div.b-pagination > ul.b-pagination-list');
  const text = lastDom.find('li.b-pagination-item:last-child > a').text();
  if (!text) {
    return 1
  }
  if (text === 'Next') {
    const prevDomText =  lastDom.find('li.b-pagination-item:nth-last-child(2) > a').text() || '';
    return prevDomText ? (isNaN(prevDomText * 1) ? 1 : prevDomText * 1) : 1;
  } else {
    return text ? (isNaN(text * 1) ? 1 : text * 1) : 1;
  }
};

module.exports = service;
