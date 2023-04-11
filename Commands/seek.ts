import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import ActionEmbed from "../Responses/Action";
import Locale from "../Responses/Locale";
import RFCommand from "./BaseCommand";

export default class SeekCommand extends RFCommand {

    info = {
        name: 'seek',
        description: "Navigate to a time in the track.",
        options: [
            {
                name: "forwards",
                description: "Travel forwards in the track.",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "time",
                        description: "Time to go forward (in seconds).",
                        type: ApplicationCommandOptionType.Number,
                        required: true
                    }
                ]
            },
            {
                name: "backwards",
                description: "Travel backwards in the track.",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "time",
                        description: "Time to go backwards (in seconds).",
                        type: ApplicationCommandOptionType.Number,
                        required: true
                    }
                ]
            },
        ]
    }

    async callback() {

        return new Promise(async (res, rej) => {

            const locale = new Locale(this.interaction)

            const queue = this.client.queueMap.get(this.interaction.guildId)

            // Get if we should go forwards or backwards
            const operation = this.interaction.options.getSubcommand(true) as "forwards" | "backwards"
            const time = this.interaction.options.getNumber("time", true)

            if (operation === "forwards") {

                // Seek forwards in the track
                await queue.seek(time).catch(async (err) => {

                    // Send a fail
                    res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: locale.responses.tracks.seek.fail(time), icon: "🛑" }).constructEmbed().embed ] }));
                    throw err;

                })

                // Confirm the Seek Forwards operation
                return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: locale.responses.tracks.seek.success.forwards(time), icon: "⏩" }).constructEmbed().embed ] }));

            } else if (operation === "backwards") {

                // Seek backwards in the track
                await queue.seek(-time).catch(async (err) => {

                    // Send a fail
                    res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: locale.responses.tracks.seek.fail(time), icon: "🛑" }).constructEmbed().embed ] }));
                    throw err;

                })

                // Confirm the Seek Backwards operation
                return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: locale.responses.tracks.seek.success.backwards(time), icon: "⏪" }).constructEmbed().embed ] }));

            }
            


        })

    }

}
