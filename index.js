/** @enum {number} */
export const Browser = {
  FIREFOX: 0,
  CHROME: 1,
  SAFARI: 2,
  ANDROID: 3
};

export const BROWSER = (() => {
  if (/Firefox/.exec(navigator.userAgent)) {
    return Browser.FIREFOX;
  }
  if (window.isAndroid || window.chrome == null) {
    return Browser.ANDROID;
  }
  if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
    return Browser.SAFARI;
  }
  return Browser.CHROME;
})();

function mangleStorageKey(key, version='') {
  return `${version || storage.version}$$${key}`;
}

async function getStorage(key, version='') {
  const versionKey = mangleStorageKey(key, version);
  const result = await this.rawGet(versionKey);
  return result ? result[versionKey] : result;
}

async function setStorage(key, value, version='') {
  const versionKey = mangleStorageKey(key, version);
  let obj = {};
  obj[versionKey] = value;
  return await this.rawSet(obj);
}

Storage.prototype.get = getStorage;
Storage.prototype.set = setStorage;

module.exports = { Storage };

/**
 * @constructor
 * @param {String} version 
 */
function Storage(version) {
  this.version = version;

  switch (BROWSER) {
  case Browser.ANDROID:
    this.rawGet = async key => {
      let data = {};
      try {
        data[key] = JSON.parse(localStorage[key]);
      } catch (e) {
        data[key] = localStorage[key];
      }
      return data;
    };

    this.rawSet = async obj => {
      let key = Object.keys(obj)[0];
      localStorage[key] = JSON.stringify(obj[key]);
    };
    break;
  case Browser.FIREFOX:
    // @ts-ignore
    // eslint-disable-next-line no-undef
    browser.storage.onChanged.addListener(updateChangedStores);
    this.rawGet = async (key) => {
      // @ts-ignore
      // eslint-disable-next-line no-undef
      return await browser.storage.local.get(key);
    };

    this.rawSet = async (obj) => {
      // @ts-ignore
      // eslint-disable-next-line no-undef
      return await browser.storage.local.set(obj);
    };
    break;
  default:
    // @ts-ignore
    // eslint-disable-next-line no-undef
    chrome.storage.onChanged.addListener(updateChangedStores);
    this.rawGet = (key) => {
      return new Promise((res) => {
        // @ts-ignore
        // eslint-disable-next-line no-undef
        chrome.storage.local.get(key, res);
      });
    };

    this.rawSet = (obj) => {
      return new Promise((res) => {
        // @ts-ignore
        // eslint-disable-next-line no-undef
        chrome.storage.local.set(obj, res);
      });
    };
  }
}
