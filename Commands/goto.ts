import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import ActionEmbed from "../Responses/Action";
import Locale from "../Responses/Locale";
import RFCommand from "./BaseCommand";

export default class GotoCommand extends RFCommand {

    info = {
        name: 'goto',
        description: "Go to a specific track in the queue.",
        options: [
            {
                name: "position",
                description: "The position of the track in the queue to go to.",
                type: ApplicationCommandOptionType.Number,
                required: true
            },
        ]
    }

    async callback() {

        return new Promise(async (res, rej) => {

            const locale = new Locale(this.interaction)

            // Get the user passed index to query (Base 1)
            const trackIndex = this.interaction.options.getNumber("position", true)

            // Get the user's current voice channel
            const member = this.interaction.member as GuildMember
            const channelId = member?.voice.channelId

            // Get the queue for this guild
            const queue = this.client.findQueue(this.interaction.guildId, channelId)
                queue.eventsChannel = this.interaction.channelId // Update the events channel based on this command

            // Go to the track (if possible)
            const track = await queue.goto(trackIndex - 1).catch(async (err) => {

                await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: locale.responses.tracks.goto.fail(trackIndex), icon: "🛑" }).constructEmbed(true).embed ] })
                throw err;

            })

            // Confirm the Go To operation
            return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: locale.responses.tracks.goto.success(trackIndex, track.newTrack.title, track.newTrack.source, track.newTrack.author), icon: "⏭️" }).constructEmbed().embed ] }));

        })

    }

}
