import { ActionRowBuilder, ButtonBuilder } from "discord.js";
import { APIEmbedField, APIEmbed } from "discord.js";

export enum colorPalette {
    event = 6323595,
    operation = 2201331,
    error = 15684431,
    success = 5025616,
}

export default class Embed {

    title: string
    description: string
    fields: APIEmbedField[]
    color: number

    constructor({ title, description, fields, color }: { title?: string, description?: string, fields?: APIEmbedField[], color?: number }) {
        
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
