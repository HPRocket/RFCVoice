import { Interaction, Locale as Languages } from "discord.js";
import en_US from './en_US'

export default class Locale {

    locale: typeof en_US

    constructor(interaction: Interaction) {

        const locale = interaction.locale
        if (locale == Languages.EnglishUS) {
            this.locale = en_US
        } else {
            this.locale = en_US // Default to US English
        }

    }

}
