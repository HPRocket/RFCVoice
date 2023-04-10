import ActionEmbed from "../Responses/Action";
import Locale from "../Responses/Locale";
import RFCommand from "./BaseCommand";

export default class ShuffleCommand extends RFCommand {

    info = {
        name: 'shuffle',
        description: "Toggle the shuffle on the queue.",
    }

    async callback() {

        return new Promise(async (res, rej) => {

            const locale = new Locale(this.interaction)

            // Get the queue
            const queue = this.client.queueMap.get(this.interaction.guildId)

            // Find if we should turn the shuffle on or off
            const shuffle = queue.settings.shuffle
            const result = queue.setShuffle(shuffle ? false : true)

            // Confirm the Loop operation
            return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: result ? locale.responses.tracks.shuffle.on : locale.responses.tracks.shuffle.off, icon: result ? "🔀" : "🟦" }).constructEmbed().embed ] }));

        })

    }

}
