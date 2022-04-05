require('discord.js');

// const client = require('./client.js')
// const loginClient = require('./discordClient.js')

module.exports = async function loggy(client, log) {

    const cli = await client
    const logChannel = await cli.channels.cache.get(process.env.CHANNEL_ID)
    // console.log('send')
    await logChannel.send(log)
    // cli.destroy()

};

// module.exports = async function quitLoggy(client) {

//     client.destroy()

// };

// loggy()