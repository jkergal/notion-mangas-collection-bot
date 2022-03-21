const puppeteer = require("puppeteer")

async function openSite() {
    const browser = await puppeteer.launch({headless: false, ignoreDefaultArgs: ['--disable-extensions']})
    console.log('prout')
    // const page = browser.newPage()
}

openSite()