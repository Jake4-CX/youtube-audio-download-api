import YTDlpWrap from 'yt-dlp-wrap';
import fs = require('fs');
import os = require('os');
import logger from './logger';

let ytDlp: YTDlpWrap;

declare global {
  var __ytDlp: YTDlpWrap | undefined;
}

if (!global.ytDlp) {
  global.ytDlp = ytDlp;
}

ytDlp = global.ytDlpWrap;

async function initializeytDlp() {

  const fileName = os.platform() == 'win32' ? 'yt-dlp.exe' : 'yt-dlp';

  try {
    if (!(fs.existsSync('./' + fileName))) {
      logger.info("Downloading YT-DLP...");
      await YTDlpWrap.downloadFromGithub();
    }
  } catch (error) {
    logger.info("Failed downloading YT-DLP, with error: " + error);
  }

  const ytDlpWrap = new YTDlpWrap('./' + fileName);

  ytDlp = ytDlpWrap;

  logger.info("YT-DLP initialized");

}

initializeytDlp();

export { ytDlp };