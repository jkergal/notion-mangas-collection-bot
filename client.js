const { Client, Intents } = require('discord.js');
require('dotenv').config()



async function loginClient () {
    const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
    await client.login(process.env.DISCORD_TOKEN)
    await client.once('ready', (client) => {
        console.log('READY TO DISPLAY LOGS !')
        console.log(client)
        return client
    }, client)

    // console.log('cli finished')
    return client 
}

module.exports = loginClient()
