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
        name: 'loop',
        description: "Loop the music bot.",
        options: [
            {
                name: "track",
                description: "Toggle the track loop.",
                type: ApplicationCommandOptionType.Subcommand,
            },
            {
                name: "queue",
                description: "Toggle the queue loop.",
                type: ApplicationCommandOptionType.Subcommand,
            }
        ]
    }

    async callback() {

        return new Promise(async (res, rej) => {

            // Get the queue
            const queue = this.client.queueMap.get(this.interaction.guildId)

            // Find if we should toggle the loop of the track or queue
            const subCommand = this.interaction.options.getSubcommand(true)
            if (subCommand === "track") {

                const trackLoop = queue.settings.loop.track

                // Toggle to the opposite
                const result = queue.setLoop("TRACK", trackLoop ? false : true)

                // Confirm the Loop operation
                return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: result ? `Now looping the current track.` : `Stopped looping the current track.`, icon: result ? "🔂" : "🟦" }).constructEmbed().embed ] }));

            } else if (subCommand === "queue") {

                const queueLoop = queue.settings.loop.queue

                // Toggle to the opposite
                const result = queue.setLoop("QUEUE", queueLoop ? false : true)

                // Confirm the Loop operation
                return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: result ? `Now looping the queue.` : `Stopped looping the queue.`, icon: result ? "🔂" : "🟦" }).constructEmbed().embed ] }));

            }

        })

    }

}
