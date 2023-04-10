import { Interaction, Locale as Languages } from "discord.js";
import en_US from './en_US'

export default class Locale {

    responses: typeof en_US.responses

    constructor(interaction: Interaction) {

        const locale = interaction.locale
        if (locale == Languages.EnglishUS) {
            this.responses = en_US.responses
        } else {
            this.responses = en_US.responses // Default to US English
        }

    }

}
