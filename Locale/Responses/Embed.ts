import { APIActionRowComponent, APIMessageActionRowComponent, ActionRowBuilder, ButtonBuilder } from "discord.js";
import { APIEmbedField, APIEmbed, HexColorString } from "discord.js";

export default class Embed {

    title: string
    description: string
    fields: APIEmbedField[]
    color: HexColorString

    constructor({ title, description, fields, color }: { title?: string, description?: string, fields?: APIEmbedField[], color?: HexColorString }) {
        
        this.title = title
        this.description = description
        this.fields = fields
        this.color = color

    }

    constructEmbed(): { embed: APIEmbed, components?: ActionRowBuilder<ButtonBuilder>[] } {

        return {
            embed: {},
            components: [],
        }

    }

}
