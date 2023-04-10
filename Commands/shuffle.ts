import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";
import { RFClient } from "../main";
import ActionEmbed from "../Responses/Action";

export default class Loop {

    client: RFClient
    interaction: ChatInputCommandInteraction

    constructor(client: RFClient, interaction?: ChatInputCommandInteraction) {

        this.client = client
        this.interaction = interaction

    }

    info = {
        name: 'shuffle',
        description: "Toggle the shuffle on the queue.",
    }

    async callback() {

        return new Promise(async (res, rej) => {

            // Get the queue
            const queue = this.client.queueMap.get(this.interaction.guildId)

            // Find if we should turn the shuffle on or off
            const shuffle = queue.settings.shuffle
            const result = queue.setShuffle(shuffle ? false : true)

            // Confirm the Loop operation
            return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: result ? `Now shuffling the queue.` : `Stopped shuffling the queue.`, icon: result ? "🔀" : "🟦" }).constructEmbed().embed ] }));

        })

    }

}
