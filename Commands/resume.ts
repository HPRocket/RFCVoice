import { getVoiceConnection } from "@discordjs/voice";
import ActionEmbed from "../Responses/Action";
import Locale from "../Responses/Locale";
import RFCommand from "./BaseCommand";
import { GuildMember } from "discord.js";
import PauseCommand from "./pause";

export default class ResumeCommand extends RFCommand {

    info = {
        name: 'resume',
        description: "Resume the queue.",
    }

    // Allow /pause and /resume to be used interchangeably
    callback = new PauseCommand(this.client, this.interaction).callback

}
