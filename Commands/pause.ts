import { getVoiceConnection } from "@discordjs/voice";
import ActionEmbed from "../Responses/Action";
import Locale from "../Responses/Locale";
import RFCommand from "./BaseCommand";
import { GuildMember } from "discord.js";

/*

Allow /pause and /resume to be used interchangeably

*/
export default class PauseCommand extends RFCommand {

    info = {
        name: 'pause',
        description: "Pause the queue.",
    }

    async callback() {

        return new Promise(async (res, rej) => {
            const locale = new Locale(this.interaction)

            // Get the user's current voice channel
            const member = this.interaction.member as GuildMember
            const channelId = member?.voice.channelId
            
            // Get the queue for this guild
            const queue = this.client.findQueue(this.interaction.guildId, channelId)
                queue.eventsChannel = this.interaction.channelId // Update the events channel based on this command

            // Pause the Queue
            const result = queue.togglePause()

            return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ 
                content: result ? locale.responses.queue.playing.pause : locale.responses.queue.playing.resume, 
                icon: result ? "⏸️" : "▶️" })
                .constructEmbed().embed 
            ]}));

          
        })

    }

}
