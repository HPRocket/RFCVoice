import { ChatInputCommandInteraction } from "discord.js";
import { RFClient } from "../main";
import ActionEmbed from "../Responses/Action";

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

        return new Promise(async (res, rej) => {

            const queue = this.client.queueMap.get(this.interaction.guildId)
            const result = queue.clear()

            // Confirm the Clear operation
            return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: "Cleared the queue.", icon: "🗑️" }) ] }));

        })

    }

}
