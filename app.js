const puppeteer = require("puppeteer")
const prompt = require('prompt-sync')()
const dotenv = require('dotenv');
const { Client } = require("@notionhq/client")

dotenv.config()

const DATABASE_ID = "6d6c9b8682ea4c9e9747efb7b6421d34"

const notion = new Client ({
    auth: process.env.API_TOKEN
})

async function updateNotificationsDb(manga) {
    const mangaName = manga
    // const users = await notion.users.list()
    // console.log(users)
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

async function updateCollectionDb(volumeNumber, manga) {
    // const users = await notion.users.list()
    // console.log(users)
    const narutoPageId = "d1c28294d4d547f68cfeb8c4df26f886"
    const vol = volumeNumber
    // console.log(vol)
    const response = await notion.pages.update({
      page_id: narutoPageId,
      properties: {
        'Last Vol.': {
          number: vol,
        },
      },
    });
    console.log(response);
    updateNotificationsDb(manga)
}

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

        // WIP : get the element that matches with whta we want

        // let elements = document.querySelector("#searchAccordion > div:nth-child(1) > ul ").childNodes
        // let table = []
        // for (let i = 0; i < elements.length; i++) {
        //     if (elements[i].nodeName = "#comment") {
        //         table.push(elements[i].data)
        //     }
        //   }
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

    updateCollectionDb(lastVolume, mangaName)
    
}


openSite()
