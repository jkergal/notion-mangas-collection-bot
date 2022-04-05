const { Client, Intents } = require('discord.js');
require('dotenv').config()



module.exports = async function launchLoggy () {
    const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
    await client.login(process.env.DISCORD_TOKEN)
    await client.once('ready', () => {
        console.log('READY TO DISPLAY LOGS !')
    })
    
    return client 
}

// module.exports = async function quitDiscordClient(client) {
//     client.destroy()
// }


