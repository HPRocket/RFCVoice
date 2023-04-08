import { ApplicationCommandOptionType, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { RFClient } from "../main";
import Track from "../Classes/Track";

export default class Connect {

    client: RFClient
    interaction: ChatInputCommandInteraction

    constructor(client: RFClient, interaction?: ChatInputCommandInteraction) {

        this.client = client
        this.interaction = interaction

    }

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
            const result = await queue.move(trackPos - 1, newPos - 1).catch((err) => {

                this.interaction.editReply("Unable to move the track.")
                throw err;

            })

            // Confirm the Move operation
            return this.interaction.editReply(`Moved the track at ${trackPos} to ${newPos}.`); // This is technically untrue if we account for the interal fix the Array automatically does.

        })

    }

}
