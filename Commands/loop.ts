import { ApplicationCommandOptionType } from "discord.js";
import ActionEmbed from "../Responses/Action";
import Locale from "../Responses/Locale";
import RFCommand from "./BaseCommand";

export default class LoopCommand extends RFCommand {

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

            const locale = new Locale(this.interaction)

            // Get the queue
            const queue = this.client.queueMap.get(this.interaction.guildId)

            // Find if we should toggle the loop of the track or queue
            const subCommand = this.interaction.options.getSubcommand(true)
            if (subCommand === "track") {

                const trackLoop = queue.settings.loop.track

                // Toggle to the opposite
                const result = queue.setLoop("TRACK", trackLoop ? false : true)

                // Confirm the Loop operation
                return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: result ? locale.responses.tracks.loop.track.on : locale.responses.tracks.loop.track.off, icon: result ? "🔂" : "🟦" }).constructEmbed().embed ] }));

            } else if (subCommand === "queue") {

                const queueLoop = queue.settings.loop.queue

                // Toggle to the opposite
                const result = queue.setLoop("QUEUE", queueLoop ? false : true)

                // Confirm the Loop operation
                return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: result ? locale.responses.tracks.loop.queue.on : locale.responses.tracks.loop.queue.off, icon: result ? "🔂" : "🟦" }).constructEmbed().embed ] }));

            }

        })

    }

}
