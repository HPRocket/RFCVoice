import { APIEmbedField } from "discord.js";
import Embed, { colorPalette } from "./Embed";

export default class EventEmbed extends Embed {

    constructor(info: { title?: string, content: string, fields?: APIEmbedField[] }) {

        super({ title: info.title, description: info.content, fields: info.fields })

    }

    constructEmbed() {
        
        return {
            embed: {

                title: this.title,
                description: this.description,
                fields: this.fields ?? [],
                color: colorPalette.event,

            },
        }

    }

}
