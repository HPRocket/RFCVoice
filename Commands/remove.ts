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

            // Get the user's current voice channel
            const member = this.interaction.member as GuildMember
            const channelId = member?.voice.channelId

            // Get the queue for this guild
            const queue = this.client.findQueue(this.interaction.guildId, channelId)

            // Get the user passed index to remove (**Base 1)
            const trackPos = this.interaction.options.getNumber("position", true)

            // Remove the track
            const result = await queue.remove(trackPos - 1 /* Base-0 Fix */).catch(async (err) => {
                await this.interaction.editReply(`Could not find a track at ${"`"}${trackPos}${"`"}.`)
                throw err;
            })

            // Confirm the Remove operation
            return this.interaction.editReply(`Removed ${result.title} by ${result.author} from position ${"`"}${trackPos}${"`"}.`);

        })

    }

}
