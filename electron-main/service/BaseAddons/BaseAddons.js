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
    const addonsList = findAddonsList($);
    const maxPage = findAddonsMaxPageNum($);
    const size = 20;

    callback({
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

  $('body > div.flex.flex-col.min-h-full.min-h-screen > main > div.z-0 > div.container > section > div.px-2.flex-1 > div > div:nth-child(3) > div > div.my-2')
    .each((i, el) => {
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

// 获取curse的最大页码
const findAddonsMaxPageNum = ($) => {
  const lastDom = $('body > div.flex.flex-col.min-h-full.min-h-screen > main > div.z-0 > div > section > div.px-2.flex-1 > div > div:nth-child(1) > div > div:nth-child(2) > div:nth-child(2) > div.pagination');
  const arr = [];
  lastDom.find('span').each((i, el) => {
    let val = $(el).text();
    if (!isNaN(val)) {
      arr.push(parseInt(val))
    }
  });

  return arr[arr.length - 1]
};

module.exports = service;
