require('discord.js');

module.exports = function quitLoggy(client) {

    setTimeout(
        async function destroy() {
        console.log("Waiting for Loggy's deconnexion : 15sec...")
        await client.destroy()
    }, 15000)

};