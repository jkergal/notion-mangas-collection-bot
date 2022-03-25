const puppeteer = require("puppeteer")
const prompt = require('prompt-sync')()
const dotenv = require('dotenv');
const { Client } = require("@notionhq/client")

dotenv.config()

const notion = new Client ({
    auth: process.env.API_TOKEN
})

async function updateNotificationsDb(mangaName, volumeNumber) {
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
                  content: mangaName.toUpperCase() + " 💥 le tome " + volumeNumber + " est sorti !",
                },
              },
            ],
          },
        },
      });
      // console.log(response);
}

async function updateCollectionDb(volumeNumber, mangaName, mangaPageId, nextVolumeDate) {
    const vol = volumeNumber
    // const date = nextVolumeDate
    if (nextVolumeDate == null) {
      const response = await notion.pages.update({
        page_id: mangaPageId,
        properties: {
          'Last Vol.': {
            number: vol,
          },
        },
      });
      console.log(response);

    } else {
      const response = await notion.pages.update({
        page_id: mangaPageId,
        properties: {
          'Last Vol.': {
            number: vol,
          },
          'Next Vol.': {
            "rich_text": [
              {
                "type": "text",
                "text": {
                  "content": nextVolumeDate
                }
              }
            ]
          },
        },
      });
      console.log(response);

    }


    updateNotificationsDb(mangaName, volumeNumber)
}

async function listMangas() {
  const databaseId = 'cb8fcd77ad6544858bf6c2b2d06ccee6';
  let mangasPages = []
  const response = await notion.databases.query({
    database_id: databaseId,
  });

  for(var i in response.results) {
    mangasPages.push({ "mangaName" : response.results[i].properties.Name.title[0].plain_text , "mangaPageId" : response.results[i].id , "mangaUrl" : response.results[i].properties.URL.rich_text[0].href })
  }

  openBrowser(mangasPages)
}

async function openBrowser(mangasPages) {

    async function launchScrapping(mangaName, mangaPageId, mangaUrl) {
      await page.goto(mangaUrl)
      await page.waitForSelector('#numberblock', 5000)
      const lastVolume = await page.evaluate(() => {
  
          let textNodes = [];
          let topNodes = document.getElementById('numberblock').childNodes;
          for (var i = 0; i < topNodes.length; i++) {
                  textNodes.push(topNodes[i]);
          }
          return parseInt(textNodes[1].innerText.replace(/\D/g,''))
  
      }
      )
      const nextVolumeDate = await page.evaluate(() => {
  
        let textNodes = [];

        if (document.querySelector("#nextvol > span > a") != null) {
          let topNodes = document.querySelector("#nextvol > span > a").childNodes;
          for (var i = 0; i < topNodes.length; i++) {
                  textNodes.push(topNodes[i]);
          }
          return textNodes[2].textContent.replaceAll('\n','').replaceAll(' ','')
        } else {
          return ''
        }



    }
    )
  
      await page.goto('about:blank')
  
      console.log(`Coucou Jess, ici le bot manga de Jojo. \n Le manga ${mangaName} en est rendu au volume : ${lastVolume}`)
      console.log(nextVolumeDate)
  
      updateCollectionDb(lastVolume, mangaName, mangaPageId, nextVolumeDate)
    }

    const browser = await puppeteer.launch({headless: false, args: ['--lang=en']})

    const page = await browser.newPage()

    for (let i = 0; i < mangasPages.length; i++) {
      await launchScrapping(mangasPages[i].mangaName, mangasPages[i].mangaPageId, mangasPages[i].mangaUrl)
    }

}


listMangas()
