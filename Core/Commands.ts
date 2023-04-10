import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { RFClient } from "../main";
import Commands from '../Commands'
import { joinVoiceChannel } from "@discordjs/voice";

export default async function RunCommand(client: RFClient, interaction: ChatInputCommandInteraction) {

    // Get the callback
    const command = Commands.find(command => command.name === interaction.commandName)

    // Defer the command
    await interaction.deferReply()

    // Run checks \\
    const clientMember = await interaction.guild.members.fetch(client.user.id)

    // Bot doesn't connect automatically on run
    if (!command.autoJoin) {

        if (!clientMember.voice.channelId) {

            // The bot is not in a voice channel

            return await interaction.editReply("Please connect me to a voice channel to run this command!").catch((err) => { throw err; })

        }

    } else { // Bot automatically connects on run

        const interactionMember = interaction.member as GuildMember
        const interactionMemberChannel = interactionMember?.voice.channel

        // Command will expect a connection; connect the bot
        joinVoiceChannel({
            channelId: interactionMemberChannel.id,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        })

    }

    // Member must be in the same channel as the client
    if (command.sameChannel) {

        const interactionMember = interaction.member as GuildMember
        
        if (clientMember.voice.channelId && (clientMember.voice.channelId !== interactionMember.voice.channelId)) {

            return await interaction.editReply("Please join my voice channel!").catch((err) => { throw err; })

        }

    }

    // Run the callback
    await new command.class(client, interaction).callback().catch(() => {})

}


export async function RegisterCommands(client: RFClient) {

    let commandsData: { name: string, description: string }[] = [] 
    for (const command of Commands) {
        const commandInfo = new command.class(client).info
        commandsData.push(commandInfo)
    }

    // Globally apply the commands
    await client.application.commands.set(commandsData).catch((err) => { throw err; });

    // Apply the commands to the test guild
    try {

        const testGuild = await client.guilds.fetch(process.env.TESTGUILD);
        testGuild.commands.set(commandsData);

    } catch (e) {

        console.error(e);

    }

}
