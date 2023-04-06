import { Snowflake } from "discord.js";

export default class Configurations {

    guildId: Snowflake
    
    constructor(guildId: Snowflake) {

        this.guildId = guildId

    }

    create() {

        // Make file (if no duplicate)

    }

    get() {

        // Load file (if found)

    }

}