import { Snowflake } from "discord.js";
import * as fs from 'fs/promises'

export type configType = {
    vcCategory: Snowflake,
    createVC: Snowflake,
    privateVC: boolean,
    allowMassPingVCChannel: boolean,
}

export default class Config {

    async getExisting(guildId: Snowflake) {
        const files = await fs.readdir(`${__dirname}`)

        for (const file of files) {
            
            if (file == `${guildId}.json`) {

                const fileContent = await fs.readFile(`./Configs/${guildId}.json`, "utf-8")
                return JSON.parse(fileContent);

            } else {

                return await this.create(guildId);

            }

        }
    }

    async create(guildId: Snowflake, settings?: configType) {
        if (!settings) {

            // FEATURE: Write file with default config:
            let defaultConfig = {
                vcCategory: "0",
                createVC: "0",
                privateVC: false,
                allowMassPingVCChannel: false
            }

            return defaultConfig;

        } else if (settings) {

            // FEATURE: Write file with new settings:

            return settings;

        }
    }

    async edit(guildId: Snowflake, newSettings?: configType) {
        // FEATURE: TBD
    }

}