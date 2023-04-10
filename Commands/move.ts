import { ApplicationCommandOptionType, GuildMember } from "discord.js";
import ActionEmbed from "../Responses/Action";
import Locale from "../Responses/Locale";
import RFCommand from "./BaseCommand";

export default class MoveCommand extends RFCommand {

    info = {
        name: 'move',
        description: "Move a track in the queue.",
        options: [
            {
                name: "track",
                description: "The position of the track in the queue to move.",
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
            {
                name: "position",
                description: "The new position to move the track to.",
                type: ApplicationCommandOptionType.Number,
                required: true,
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

            // Get the user passed index for the track TO move (**Base 1)
            const trackPos = this.interaction.options.getNumber("track", true)

            // Get the user passed index to move TO (** Base 1)
            const newPos = this.interaction.options.getNumber("position", true)

            // Move the track
            const result = await queue.move(trackPos - 1, newPos - 1).catch(async (err) => {

                await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: locale.responses.tracks.move.fail(newPos), icon: "🛑" }).constructEmbed(true).embed ] })
                throw err;

            })
            
            // Confirm the Move operation
            return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: locale.responses.tracks.move.success(trackPos, newPos), icon: "🛒" }).constructEmbed().embed ]})); // This is technically untrue if we account for the interal fix the Array automatically does.

        })

    }

}
