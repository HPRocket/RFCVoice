import { ChatInputCommandInteraction } from "discord.js";
import { RFClient } from "../main";

export default class Connect {

    client: RFClient
    interaction: ChatInputCommandInteraction

    constructor(client: RFClient, interaction?: ChatInputCommandInteraction) {

        this.client = client
        this.interaction = interaction

    }

    info = {
        name: 'clear',
        description: "Clear the queue.",
    }

    async callback() {

        return new Promise((res, rej) => {

            const queue = this.client.queueMap.get(this.interaction.guildId)
            const result = queue.clear()

            // Confirm the Clear operation
            return this.interaction.editReply(`Cleared the queue.`);

        })

    }

}
