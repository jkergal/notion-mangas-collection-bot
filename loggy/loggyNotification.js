require('discord.js');

module.exports = async function loggyNotification(client, log) {

    const userId = process.env.USER_ID
    const cli = await client
    const logChannel = await cli.channels.cache.get(process.env.CHANNEL_ID_NOTIFICATIONS)
    await logChannel.send(`${log} --- <@${userId.toString()}>`)

}