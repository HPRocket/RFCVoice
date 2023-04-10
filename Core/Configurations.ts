import { Snowflake } from "discord.js";
import * as fs from 'fs/promises'

type Config = {
    guildId: Snowflake,
    voiceManager: {
        "createChannelId": Snowflake,
        "channelCategoryId": Snowflake,
    },
}

export default class Configurations {

    guildId: Snowflake
    
    constructor(guildId: Snowflake) {

        this.guildId = guildId

    }

    async create(createChannel?: Snowflake, createCategory?: Snowflake): Promise<Config> {
        return new Promise(async (res, rej) => {

            const data = {
                "guildId": this.guildId,
                "voiceManager": {
                    "createChannelId": createChannel ?? "",
                    "channelCategoryId": createCategory ?? ""
                }
            }

            // Create file
            await fs.writeFile(`./Configurations/${this.guildId}.json`, JSON.stringify(data), "utf8").catch((err) => {
                throw err;
            })

            return data;
            
        })

    }

    async get(): Promise<Config> {
        return new Promise(async (res, rej) => {

            // Load file (if found)
            const file = await fs.readFile(`./Configurations/${this.guildId}.json`, "utf8").catch(async (err) => {
                
                console.error(err)
                const config = await this.create(); // Create a config
                return res(config)

            })

            return file ? res(JSON.parse(file)) : rej(false)

        })
    }

}
