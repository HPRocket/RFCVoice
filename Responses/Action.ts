import { APIEmbedField } from "discord.js";
import Embed, { colorPalette } from "./Embed";

export default class ActionEmbed extends Embed {

    icon: string

    constructor(info: { title?: string, content: string, icon?: string }) {

        super({ title: info.title, description: info.content })

        this.icon = info.icon

    }

    constructEmbed(fail?: boolean) {
        
        return {
            embed: {

                title: this.title,
                description: `${this.icon ? `${this.icon}｜` : ""}${this.description}`,
                fields: this.fields ?? [],
                color: fail ? colorPalette.error : colorPalette.success,

            },
        }

    }

}
