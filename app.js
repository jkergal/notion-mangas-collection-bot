const puppeteer = require("puppeteer")
const prompt = require('prompt-sync')()


async function openSite() {
    // Get Manga Card page Url
    const mangaName = await prompt("Quel Manga t'intéresse? ")
    // const mangaSelector = await `[title="Serie manga - ${mangaName}"]`
    // console.log(mangaName)
    // console.log(mangaSelector)
    const browser = await puppeteer.launch({headless: false, ignoreDefaultArgs: ['--disable-extensions']})
    const page = await browser.newPage()
    await page.goto(`https://www.manga-news.com/index.php/recherche/?q=${mangaName}`)

    await page.waitForSelector("#searchAccordion")

    const mangaUrl = await page.evaluate((manga) => {
        // const manga = prompt("Retape le nom de ton manga pour confirmer : ")
        return document.querySelector(`[title="Serie manga - ${manga}"]`).href
    }, mangaName)
    


    // Go to Manga Card page and get data
    const page2 = await browser.newPage()
    await page2.goto(mangaUrl)
    const currentVolume = await page2.evaluate(() => {

        let textNodes = [];
        let topNodes = document.getElementById('numberblock').childNodes;
        for (var i = 0; i < topNodes.length; i++) {
                textNodes.push(topNodes[i]);
        }
        return textNodes[1].innerText.replace(/\D/g,'')

    }
    )

    console.log(`Coucou Jess, ici le bot manga de Jojo. \n Le manga ${mangaName} en est rendu au volume : ${currentVolume}`)

    openSite()
    
}


openSite()
