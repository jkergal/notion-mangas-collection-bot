const puppeteer = require("puppeteer")
const dotenv = require('dotenv');
const { Client } = require("@notionhq/client")
const loggy = require('./loggy/loggy')
const quitLoggy = require('./loggy/quitLoggy')
const launchLoggy = require('./loggy/launchLoggy')
const loggyNotification = require('./loggy/loggyNotification')

dotenv.config()
todayDate = new Date()


//------------------------------------------------//
//----------------CONFIG VARS---------------------//
//------------------------------------------------//

const MANGAS_DB_ID = process.env.NOTION_MANGAS_DB_ID

const NOTIFS_DB_ID = process.env.NOTION_NOTIFS_DB_ID



//------------------------------------------------//
//------------------NOTION CLIENT-----------------//
//------------------------------------------------//

const notion = new Client ({
    auth: process.env.NOTION_API_TOKEN
})

let notionMangasPages = []



//------------------------------------------------//
//---------------LOGGY DISCORD CLIENT-------------//
//------------------------------------------------//

let loggyClient

async function createLoggyClient () {
  loggyClient = await launchLoggy()
}



//------------------------------------------------//
//-----------------TOOLS FUNCTIONS----------------//
//------------------------------------------------//

function areDatesSame(obj1, obj2) {
  if (obj1 != null) {
    const obj1Length = Object.keys(obj1).length;
    const obj2Length = Object.keys(obj2).length;
  
    if (obj1Length === obj2Length) {
        return Object.keys(obj1).every(
            key => obj2.hasOwnProperty(key)
                && obj2[key] === obj1[key]);
    }
    return false;
  } else {
    if (obj2.start == null) {
      return true
    } else {
      return false
    }
  }
 
}


function resetNotionMangasArray() {
  notionMangasPages = []
}



//------------------------------------------------//
//---------------NOTION CURRENT DATA--------------//
//------------------------------------------------//

async function listNotionCurrentData() {
  const databaseId = MANGAS_DB_ID

  const response = await notion.databases.query({
    database_id: databaseId,
  });

  for(var i in response.results) {
    await notionMangasPages.push({ 
      "mangaName" : response.results[i].properties.Name.title[0].plain_text , 
      "mangaPageId" : response.results[i].id , 
      "mangaUrl" : response.results[i].properties.URL.rich_text[0].href , 
      "lastVolume" : response.results[i].properties.LastVol.number,
      "nextVolumeDate" : response.results[i].properties.NextVol.date,
      "volOwned" : response.results[i].properties.Vol.number
    })
    // console.log(notionMangasPages[i])
  }

  openBrowser()

}



//------------------------------------------------//
//--------------NOTION NOTIFICATIONS--------------//
//------------------------------------------------//

async function sendNotificationVolume(i, lastVolume) {

    console.log("💥 " + notionMangasPages[i].mangaName.toUpperCase() + " --- Vol. " + lastVolume + " sorti !")
    await loggyNotification(loggyClient, "💥 " + notionMangasPages[i].mangaName.toUpperCase() + " --- Vol. " + lastVolume + " sorti !")
    await loggy(loggyClient, "💥 " + notionMangasPages[i].mangaName.toUpperCase() + " --- Vol. " + lastVolume + " sorti !")
    
    const notificationsDbId = NOTIFS_DB_ID
    const response = await notion.pages.create({
        parent: {
          database_id: notificationsDbId,
        },
        properties: {
          Manga: {
            title: [
              {
                text: {
                  content: "💥 " + notionMangasPages[i].mangaName.toUpperCase(),
                },
              },
            ],
          },
          Notification : {
          "rich_text": [
            {
              "type": "text",
              "text": {
                "content": "Vol. " + lastVolume + " sorti !"
              }
            }
          ]
        },
        dateNotification : {
          "date": { 
            start: todayDate, 
            end: null, 
            time_zone: null }
        },
        },
      });
      // console.log(response);
}


async function sendNotificationDate(nextVolumeDate, nextVolumeTitle) {

  console.log("📆 " + nextVolumeTitle.toUpperCase() + " --- Date de sortie : " + nextVolumeDate.start.replaceAll('-', '/'))
  await loggyNotification(loggyClient, "📆 " + nextVolumeTitle.toUpperCase() + " --- Date de sortie : " + nextVolumeDate.start.replaceAll('-', '/'))
  await loggy(loggyClient, "📆 " + nextVolumeTitle.toUpperCase() + " --- Date de sortie : " + nextVolumeDate.start.replaceAll('-', '/'))
  const notificationsDbId = NOTIFS_DB_ID
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
                "content": "Date de sortie : " + nextVolumeDate.start.replaceAll('-', '/')
              }
            }
          ]
        },
        dateNotification : {
          "date": { 
            start: todayDate, 
            end: null, 
            time_zone: null }
        },
      },
    });
    // console.log(response);
}



//------------------------------------------------//
//--------------MANGAS DB UPDATE------------------//
//------------------------------------------------//

async function updateNextVolumeDate(nextVolumeDate, i, nextVolumeTitle) {
  let notionNextVolumeDate = notionMangasPages[i].nextVolumeDate
  
  if (areDatesSame(notionNextVolumeDate, nextVolumeDate) == false && nextVolumeDate.start !== null) {
    const response = await notion.pages.update({
      page_id: notionMangasPages[i].mangaPageId,
      properties: {
        "NextVol": {
          "date": nextVolumeDate
        }
      }
    });
    // console.log(response);

      sendNotificationDate(nextVolumeDate, nextVolumeTitle)

  } 
  
  if  (nextVolumeDate.start == null){
    const response = await notion.pages.update({
      page_id: notionMangasPages[i].mangaPageId,
      properties: {
        "NextVol": {
          "date": null
        }
      }
    });

    console.log("🟡 " + notionMangasPages[i].mangaName + ' --- Pas de nouvelle date annoncée')
    await loggy(loggyClient, "🟡 " + notionMangasPages[i].mangaName + ' --- Pas de nouvelle date annoncée')
  }
  
  else { 
    console.log("🟡 " + notionMangasPages[i].mangaName + ' --- Pas de nouvelle date annoncée')
    await loggy(loggyClient, "🟡 " + notionMangasPages[i].mangaName + ' --- Pas de nouvelle date annoncée')
  }
}


async function updateLastVolume(lastVolume, i) {
  if (notionMangasPages[i].lastVolume !== lastVolume) {
    const response = await notion.pages.update({
      page_id: notionMangasPages[i].mangaPageId,
      properties: {
        'LastVol': {
          number: lastVolume,
        }
      }
    });
    // console.log(response);

    sendNotificationVolume(i, lastVolume)

  } else {
    console.log("🟣 " + notionMangasPages[i].mangaName + ' --- Pas de nouveau volume sorti')
    await loggy(loggyClient, "🟣 " + notionMangasPages[i].mangaName + ' --- Pas de nouveau volume sorti')
  }
}


async function updateCheckbox(i) {
  if (notionMangasPages[i].lastVolume == notionMangasPages[i].volOwned) {
    const response = await notion.pages.update({
      page_id: notionMangasPages[i].mangaPageId,
      properties: {
        "OK": {
          "checkbox": true
        }
      }
    });
    // console.log(response);

  } else {
    const response = await notion.pages.update({
      page_id: notionMangasPages[i].mangaPageId,
      properties: {
        "OK": {
          "checkbox": false
        }
      }
    });
    // console.log(response);
  }
}


async function updatePublicationStatus(publicationStatus, i) {
  if (publicationStatus == 'En cours' || publicationStatus == 'ongoing' ) {
    const response = await notion.pages.update({
      page_id: notionMangasPages[i].mangaPageId,
      properties: {
        "Status": {
          "select": {
            "name": "ongoing",
          }
        }
      }
    });
    // console.log(response);

  } else {
    const response = await notion.pages.update({
      page_id: notionMangasPages[i].mangaPageId,
      properties: {
        "Status": {
          "select": {
            "name": "finished",
          }
        }
      }
    });
  }
}


//------------------------------------------------//
//--------------------SCRAPPING-------------------//
//------------------------------------------------//

async function launchScrapping(page, i) {
  console.log(notionMangasPages[i].mangaName)
  await page.goto(notionMangasPages[i].mangaUrl)
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
      return { 
        start: null, 
        end: null, 
        time_zone: null }
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

const publicationStatus = await page.evaluate(() => {

return document.querySelector("#numberblock > span:nth-child(1) > span.small").innerText.replaceAll('(', '').replaceAll(')', '')

})



  await page.goto('about:blank')

  await updateNextVolumeDate(nextVolumeDate, i, nextVolumeTitle)
  await updateLastVolume(lastVolume, i)
  await updateCheckbox(i)
  await updatePublicationStatus(publicationStatus, i)
  
}


async function openBrowser() {

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox','--disable-setuid-sandbox']
    })

    const page = await browser.newPage()

    for (let i = 0; i < notionMangasPages.length; i++) {
      await launchScrapping(page, i)
    }

    browser.close()
    quitLoggy(loggyClient)
}



//------------------------------------------------//
//-------------------LAUNCH APP-------------------//
//------------------------------------------------//

async function launchApp() {
  await createLoggyClient()

  await listNotionCurrentData()
    .then(
    resetNotionMangasArray()
  )
}

  launchApp()




