import { Snowflake } from "discord.js"

export default {

    "channelJoin": (channelId: Snowflake) => {
        return `Joined <#${channelId}>`
    },

}
