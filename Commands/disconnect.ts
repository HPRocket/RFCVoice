import { getVoiceConnection } from "@discordjs/voice";
import ActionEmbed from "../Responses/Action";
import Locale from "../Responses/Locale";
import RFCommand from "./BaseCommand";

export default class DisconnectCommand extends RFCommand {

    info = {
        name: 'disconnect',
        description: "Disconnect me from your channel.",
    }

    async callback() {

        return new Promise(async (res, rej) => {

            const locale = new Locale(this.interaction)

            const channelId = (await this.interaction.guild.members.fetch(this.client.user.id)).voice.channelId
            const connection = getVoiceConnection(this.interaction.guildId)

            connection.destroy()

            // Confirm the Disconnect operation
            return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: locale.responses.channel.disconnect(channelId), icon: "🚪" }).constructEmbed().embed ] }));

        })

    }

}
