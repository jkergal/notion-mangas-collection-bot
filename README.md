# notion-mangas-collection-bot
A bot that updates automatically informations about manga series in your Notion collection manager. 

**WARNING** : this bot is built for French manga fans. Actually, this bot scraps a french website that displays data for French manga releases.
However, feel free to fork and adapt the project for your zone ;)


## Features

List all your manga collection in one doc, with daily updated data :

- Auto-updates the last volume number released for each manga
- Auto-updates the next volume date release for each manga with volume title
- Auto-checks if your collection is full or not
- Displays dated notifications in your notion db to make you able to clearely see what's up !
- Uses 'Loggy', a bot that allows you to receive notifications in your personnal discord servers when there is new data in your notion db


## Environment Variables

To run this project, you will need to create a .env file, and write these environment variables :

`NOTION_API_TOKEN=your_secret_notion_api_token` (for Notion)

`NOTION_MANGAS_DB_ID=your_mangas_db_id` (for Notion)

`NOTION_NOTIFS_DB_ID=your_notifs_db_id` (for Notion)

`DISCORD_LOGGY_TOKEN=your_secret_discord_bot_token ` (for Loggy - Discord)

`CHANNEL_ID_1=discord_channel_id_where_you_want_logs` (for Loggy - Discord)

`CHANNEL_ID_2=discord_channel_id_where_you_want_save_logs` (for Loggy - Discord)

`USER_ID=user_you_want_to_tag_in_messages` (for Loggy - Discord)


## Get Ready

First, just clone this repo !
### Dependencies

To run this project, you'll need to install dependencies :

```npm
  npm install
``` 

### Notion Doc / Databases Setup

- Go to : https://jker.fr/notion-manga-template
- Duplicate the template to create your own Mangas Database. 
- **WARNING :** do not change any name of the table's columns.
- don't forget to copy the id of both databases (mangas and notifs), and paste it in your env file

### Notion API Setup

- Go to https://developers.notion.com/docs/getting-started
- Follow steps to set up your notion integration and link your database to it

### Discord server preparation

Create two channels in your own Discord server : 
- one to post logs
- and one to post saved logs (channel 2) 
- put notifications settings of these chans on "only mentions"

### Discord Bot Integration Setup

- Go to your Discord developper portal : https://discord.com/developers/applications
- create an app called "Loggy"
- create a bot in it called... "Loggy" (oh wow, surprising)
- don't forget to copy the secret Token of your to paste it in your .env file

### Heroku Setup

To deploy your bot on heroku, you need to set up it a little

- Puppeteer need a buildpack to work fine on Heroku, please add it in the app "settings" in Heroku (just copy / past this link) : https://github.com/jontewks/puppeteer-heroku-buildpack.git
- Add your env config vars in "settings" too (those that are in your .env files)
- If you want to schedule your bot process every days automatically, add the "Heroku Scheduler" in "Ressources > Add-Ons"



## Author

- [@jkergal](https://github.com/jkergal) (hello@johannkergal.fr)


## 🔗 Links
[![website](https://img.shields.io/badge/my_website-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://johannkergal.fr/)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/johannkergal)
[![twitter](https://img.shields.io/badge/twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/zetyd)
