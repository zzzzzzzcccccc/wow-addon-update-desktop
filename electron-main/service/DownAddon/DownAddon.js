const config = require('../../conf/index');
const request = require('superagent');
const cheerio = require('cheerio');

require('superagent-charset')(request);

/*
* @param  {object}   e                 主进程的event
* @param  {string}   path              需要下载的插件
* @param  {string}   installFilePath   接下并安装地址
* @return            callback
* */
const service = (e, rowData, callback) => {
  const downloadUrl = `${config.addonsBaseUrl}${rowData.path}/download`;

  // 获取插件下载地址
  request.get(downloadUrl).buffer(true).charset('utf-8').end((err, res) => {
    if (err) {
      callback();
      return
    }
    const $ = cheerio.load(res.text);
    const downloadUrl = getDownloadUrl($);
    // console.log('已访问到curese下载页面', downloadUrl);
    if (downloadUrl) {
      callback(`${config.addonsBaseUrl}${downloadUrl}`);
    } else {
      callback();
    }
  });
};
const getDownloadUrl = ($) => {
  const dom = $('body > div.flex.flex-col.min-h-full.min-h-screen > main > div.container > div > div:nth-child(2) > div > div:nth-child(1) > p:nth-child(2) > a');

  return dom.attr('href') || ''
};

module.exports = service;
