const dotenv = require('dotenv');
const { Client } = require("@notionhq/client")

dotenv.config()

const DATABASE_ID = "6d6c9b8682ea4c9e9747efb7b6421d34"

const notion = new Client ({
    auth: process.env.API_TOKEN
})

async function main() {
    const users = await notion.users.list()
    console.log(users)
}

main()