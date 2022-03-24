const puppeteer = require("puppeteer")
const prompt = require('prompt-sync')()
const dotenv = require('dotenv');
const { Client } = require("@notionhq/client")

dotenv.config()

const notion = new Client ({
    auth: process.env.API_TOKEN
})

async function updateNotificationsDb(manga) {
    const mangaName = manga
    const notificationsDbId = "50f813bc972b4e3386e17952250d6ae3"
    const response = await notion.pages.create({
        parent: {
          database_id: notificationsDbId,
        },
        properties: {
          Notification: {
            title: [
              {
                text: {
                  content: mangaName.toUpperCase() + " 💥 un nouveau tome est sorti !",
                },
              },
            ],
          },
        },
      });
      console.log(response);
      launchScrapping()
}

async function updateCollectionDb(volumeNumber, manga, mangaPageId) {
    const vol = volumeNumber
    const response = await notion.pages.update({
      page_id: mangaPageId,
      properties: {
        'Last Vol.': {
          number: vol,
        },
      },
    });
    console.log(response);
    updateNotificationsDb(manga, volumeNumber)
}

async function searchMangaInDb(manga, volumeNumber) {
  const mangaPage = []
  const mangaPageResult = await notion.search({
    query: manga,
  });

  // console.log(mangaPageResult.results);

  for(var i in mangaPageResult.results) {
    mangaPage.push(mangaPageResult.results[i]);
  }

  // console.log(mangaPage[0].id);

  let mangaPageId = mangaPage[0].id

  updateCollectionDb(volumeNumber, manga, mangaPageId)
}

async function launchScrapping() {
    // Get Manga Card page Url
    const mangaName = await prompt("Quel Manga t'intéresse? ")
    const browser = await puppeteer.launch({headless: false, ignoreDefaultArgs: ['--disable-extensions']})
    const page = await browser.newPage()
    await page.goto(`https://google.fr`)
    // await page.waitForNavigation()
    await page.waitForSelector('#L2AGLb > div')
    await page.click('#L2AGLb > div')
    await page.waitForSelector("body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input")
    await page.type('body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input', `${mangaName} manga-news`)
    await page.click('body > div.L3eUgb > div.o3j99.ikrT4e.om7nvf > form > div:nth-child(1) > div.A8SBwf > div.FPdoLc.lJ9FBc > center > input.gNO89b')
    await page.waitForNavigation()
    await page.waitForSelector('#rso')
    // await page.waitForSelector("#rso > div:nth-child(1) > div > div > div.yuRUbf > a")

    const mangaUrl = await page.evaluate(() => {

      return document.getElementById('rso').getElementsByTagName('a')[0].href        

    })
    


    // Go to Manga Card page and get data
    const page2 = await browser.newPage()
    await page2.goto(mangaUrl)
    // await page2.waitForNavigation()
    await page2.waitForSelector('#numberblock')
    const lastVolume = await page2.evaluate(() => {

        let textNodes = [];
        let topNodes = document.getElementById('numberblock').childNodes;
        for (var i = 0; i < topNodes.length; i++) {
                textNodes.push(topNodes[i]);
        }
        return parseInt(textNodes[1].innerText.replace(/\D/g,''))

    }
    )

    await browser.close()

    console.log(`Coucou Jess, ici le bot manga de Jojo. \n Le manga ${mangaName} en est rendu au volume : ${lastVolume}`)

    searchMangaInDb(mangaName, lastVolume)
    
}


launchScrapping()
