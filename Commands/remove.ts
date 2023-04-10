import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import ActionEmbed from "../Responses/Action";
import Locale from "../Responses/Locale";
import RFCommand from "./BaseCommand";

export default class RemoveCommand extends RFCommand {

    info = {
        name: 'remove',
        description: "Remove a track from the queue.",
        options: [
            {
                name: "position",
                description: "The position of the track in the queue.",
                type: ApplicationCommandOptionType.Number,
                required: false,
            },
        ]
    }

    async callback() {

        return new Promise(async (res, rej) => {

            const locale = new Locale(this.interaction)

            // Get the user's current voice channel
            const member = this.interaction.member as GuildMember
            const channelId = member?.voice.channelId

            // Get the queue for this guild
            const queue = this.client.findQueue(this.interaction.guildId, channelId)

            // Get the user passed index to remove (**Base 1)
            let trackPos = this.interaction.options.getNumber("position", false)
                if (!trackPos) trackPos = queue.tracks.findIndex(track => track == queue.currentTrack) + 1 // Remove the current track if an index is not specified

            // Remove the track
            const result = await queue.remove(trackPos - 1 /* Base-0 Fix */).catch(async (err) => {
                await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: locale.responses.tracks.remove.fail(trackPos), icon: "🛑" }).constructEmbed(true).embed ] })
                throw err;
            })

            // Confirm the Remove operation
            return this.interaction.editReply({ embeds: [ new ActionEmbed({ content: locale.responses.tracks.remove.success(trackPos, result.title, result.source, result.author), icon: "🗑️" }).constructEmbed().embed ] });

        })

    }

}
