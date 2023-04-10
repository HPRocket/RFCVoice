import ActionEmbed from "../Responses/Action";
import Locale from "../Responses/Locale";
import RFCommand from "./BaseCommand";

export default class SkipCommand extends RFCommand {

    info = {
        name: 'skip',
        description: "Skip the track currently playing.",
    }

    async callback() {

        return new Promise(async (res, rej) => {

            const locale = new Locale(this.interaction)

            // Get the queue
            const queue = this.client.queueMap.get(this.interaction.guildId)

            // Skip the track
            const result = await queue.skip()

            // Confirm the Skip operation
            return res(await this.interaction.editReply({ embeds: [ new ActionEmbed({ content: locale.responses.tracks.skip(result.newTrack.title, result.newTrack.source, result.newTrack.author), icon: "⏭️" }).constructEmbed().embed ] }));

        })

    }

}
