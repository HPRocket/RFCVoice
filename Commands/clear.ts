import ActionEmbed from "../Responses/Action";
import Locale from "../Responses/Locale";
import RFCommand from "./BaseCommand";

export default class ClearCommand extends RFCommand {

    info = {
        name: 'clear',
        description: "Clear the queue.",
    }

    async callback() {

        return new Promise(async (res, rej) => {

            const locale = new Locale(this.interaction)

            const queue = this.client.queueMap.get(this.interaction.guildId)
            const result = queue.clear()

            // Confirm the Clear operation
            return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: locale.responses.tracks.clear, icon: "🗑️" }).constructEmbed().embed ] }));

        })

    }

}
