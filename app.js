const puppeteer = require("puppeteer")
const dotenv = require('dotenv');
const { Client } = require("@notionhq/client")

dotenv.config()

const notion = new Client ({
    auth: process.env.API_TOKEN
})

async function sendNotificationVolume(mangaName, volumeNumber) {
    const notificationsDbId = "50f813bc972b4e3386e17952250d6ae3"
    const response = await notion.pages.create({
        parent: {
          database_id: notificationsDbId,
        },
        properties: {
          Manga: {
            title: [
              {
                text: {
                  content: "💥 " + mangaName.toUpperCase(),
                },
              },
            ],
          },
          Notification : {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "Vol. " + volumeNumber + " sorti !"
              }
            }
          ]
        },
        },
      });
      // console.log(response);
}

async function sendNotificationDate(mangaName, nextVolumeDate, nextVolumeTitle) {
  const notificationsDbId = "50f813bc972b4e3386e17952250d6ae3"
  const response = await notion.pages.create({
      parent: {
        database_id: notificationsDbId,
      },
      properties: {
        Manga: {
          title: [
            {
              text: {
                content: "📆 " + nextVolumeTitle.toUpperCase() ,
              },
            },
          ],
        },
        Notification : {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "Prochain tome : " + nextVolumeDate.start.replaceAll('-', '/')
              }
            }
          ]
        },
      },
    });
    // console.log(response);
}

async function updateNextVolumeDate(mangaName, mangaPageId, nextVolumeDate, mangasPages, i, nextVolumeTitle) {
  console.log(mangasPages[i].nextVolumeDate)
  console.log(nextVolumeDate)
  // let notionNextVolumeDate

  // if (mangasPages[i].nextVolumeDate == null) {
  //   return notionNextVolumeDate = null
  // } else {
  //   return notionNextVolumeDate = mangasPages[i].nextVolumeDate.start
  // }
  
  if (mangasPages[i].nextVolumeDate != nextVolumeDate && nextVolumeDate != null) {
    const response = await notion.pages.update({
      page_id: mangaPageId,
      properties: {
        "NextVol": {
          "date": nextVolumeDate
        }
      }
    });
    // console.log(response);

      sendNotificationDate(mangaName, nextVolumeDate, nextVolumeTitle)
    
  } else { return console.log('pas de notification')}
}

async function updateLastVolume(volumeNumber, mangaName, mangaPageId, mangasPages, i) {
  const vol = volumeNumber
  if (mangasPages[i].lastVolume !== vol) {
    const response = await notion.pages.update({
      page_id: mangaPageId,
      properties: {
        'LastVol': {
          number: vol,
        }
      }
    });
    // console.log(response);

    sendNotificationVolume(mangaName, volumeNumber)
  } else {
    return
  }
}

async function listMangas() {
  const databaseId = 'cb8fcd77ad6544858bf6c2b2d06ccee6';
  let mangasPages = []
  const response = await notion.databases.query({
    database_id: databaseId,
  });

  for(var i in response.results) {
    mangasPages.push({ 
      "mangaName" : response.results[i].properties.Name.title[0].plain_text , 
      "mangaPageId" : response.results[i].id , 
      "mangaUrl" : response.results[i].properties.URL.rich_text[0].href , 
      "lastVolume" : response.results[i].properties.LastVol.number,
      "nextVolumeDate" : response.results[i].properties.NextVol.date
    })
    // console.log(response.results[i].properties.NextVol.date)
  }
  
  openBrowser(mangasPages)
}

async function openBrowser(mangasPages) {

    async function launchScrapping(mangaName, mangaPageId, mangaUrl, i, mangasPages) {
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
          let stringDate = textNodes[2].textContent
              .replaceAll('\n','')
              .replaceAll(' ','')
          let splittedDate = stringDate.split("/")
          let notionDate = { 
            start: `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`, 
            end: null, 
            time_zone: null }
          return notionDate
        } else {
          return null
        }

    }
    )

    
    const nextVolumeTitle = await page.evaluate(() => {

      if (document.querySelector("#nextvol > span > a") != null) {
        return document.querySelector("#nextvol > span > a").title
      } else {
        return null
      }

  })
  
      await page.goto('about:blank')
  
      console.log(`Le manga ${mangaName} en est rendu au volume : ${lastVolume}`)
      console.log(nextVolumeTitle)
  
      await updateNextVolumeDate(mangaName, mangaPageId, nextVolumeDate, mangasPages, i, nextVolumeTitle)
      await updateLastVolume(lastVolume, mangaName, mangaPageId, mangasPages, i)
      
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox','--disable-setuid-sandbox']
    })

    const page = await browser.newPage()

    for (let i = 0; i < mangasPages.length; i++) {
      await launchScrapping(mangasPages[i].mangaName, mangasPages[i].mangaPageId, mangasPages[i].mangaUrl, i, mangasPages)
    }

    browser.close()
}


listMangas()
