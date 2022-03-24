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
    await page.goto(`https://www.manga-news.com/index.php/recherche/?q=${mangaName}`)

    await page.waitForSelector("#searchAccordion")

    const mangaUrl = await page.evaluate((manga) => {

        return document.querySelector(`[title="Serie manga - ${manga}"]`).href

    }, mangaName)
    


    // Go to Manga Card page and get data
    const page2 = await browser.newPage()
    await page2.goto(mangaUrl)
    const lastVolume = await page2.evaluate(() => {

        let textNodes = [];
        let topNodes = document.getElementById('numberblock').childNodes;
        for (var i = 0; i < topNodes.length; i++) {
                textNodes.push(topNodes[i]);
        }
        return parseInt(textNodes[1].innerText.replace(/\D/g,''))

    }
    )

    console.log(`Coucou Jess, ici le bot manga de Jojo. \n Le manga ${mangaName} en est rendu au volume : ${lastVolume}`)

    searchMangaInDb(mangaName, lastVolume)
    
}


launchScrapping()
