const fs = require('fs');

class util {
  /**
   * Function to take screenshot on script failure.
   * @param {*} name 
   * @param {*} failure 
   */
  static takeScreenshot(name, failure=false) {
    const path = './uitest/reports/screenshots/';
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    if (failure) {
      name = name + '_fail';
    }
    name = name.replace(/ /g, '_') + '.png';
    browser.saveScreenshot( path + name);
    const data = fs.readFileSync(`${path}/${name}`);
    allure.addAttachment(name, data, 'image/png');
  }
}

module.exports = util;