require('discord.js');

// const client = require('./client.js')
const loginClient = require('./client.js')

async function loggy() {

    cli = await loginClient
    const logChannel = await cli.channels.cache.get("960600934285713408")
    
    logChannel.send('prout')

};

loggy()