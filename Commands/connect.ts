import { ApplicationCommandOptionType } from "discord.js";
import { RFCommand } from "../Core/Commands";

export default class Connect extends RFCommand {

    info = {
        name: 'connect',
        description: "Ask me to connect to your channel.",
        options: [
            {
                name: "channel",
                description: "Choose a different channel for me to connect to.",
                type: ApplicationCommandOptionType.Channel,
                required: false
            },
        ]
    }

    async callback() {

        // insert callback here

    }

}
