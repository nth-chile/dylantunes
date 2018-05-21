// This gets all archive.org identifiers from sugarmegs based on the ENTRY variable you define below. This writes them to identifiers_ENTRY.js

const ENTRY = 'BobDylan'

const puppeteer = require('puppeteer')
const fs = require("fs")

let scrape = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('http://tela.sugarmegs.org/bands.aspx');
    await page.select('body > form > select', ENTRY)
    await page.waitFor(6000)
    const result = await page.evaluate(
      () => {
        try {
          let links = document.querySelectorAll('[href^="http://www.archive.org"]')
          let identifiers = []

          for ( let i = 0; i < links.length; i++) {
            let href = links[`${i}`].href
            let splitHref = href.split('/')

            identifiers.push(splitHref[splitHref.length - 2]);
          }

          return {
            identifiers
          }
        } catch (err) {
          return 'err'
        }
      }
    )

    browser.close();
    return result;
};

scrape().then((output) => {
    console.log("length: ", output.identifiers.length);

    fs.writeFile(`./identifiers/identifiers_${ENTRY}.js`, JSON.stringify(output),function(err) {
        if(err) return console.log(err);

        console.log("The file was saved!");
    });
});
