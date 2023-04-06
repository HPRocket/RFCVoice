import { ChatInputCommandInteraction, Client, GatewayIntentBits, Snowflake } from 'discord.js'
import * as dotenv from 'dotenv';
    dotenv.config()
import Queue from './Classes/Queue';
import { RegisterCommands } from './Core/Commands';
import Configurations from './Core/Configurations';
import onChannelChange from './Events/onChannelChange';

export type RFClient = Client & {
    queueMap: Map<Snowflake, Queue>
}

const client = new Client({ intents: [ GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers ] }) as RFClient

client.on('ready', async () => {

    console.debug(`Logged in as ${client.user?.username}!`)

    // Register the commands
    await RegisterCommands(client)

    // Set the Queue Map
    client.queueMap = new Map<Snowflake, Queue>() // Queues are added to the map on voice channel join.


    /*client.on('interactionCreate', async (interaction) => {
        
        if (interaction.inGuild()) {

            const config = await new Configurations(interaction.guildId).get()

            if (interaction.isChatInputCommand()){//type == InteractionType.ApplicationCommand) {
    
                await new Command(client, interaction as ChatInputCommandInteraction).run(config).catch((err) => { throw err; })
    
            }

            if (interaction.isButton()) {

                await onButton(interaction, client).catch((err) => { throw err; })

            }

        }

    })*/


    // Listen for voice channel changes
    client.on('voiceStateUpdate', (oldState, newState) => {
        console.log('voice state change')
        onChannelChange(client, oldState, newState)
    })

})

client.login(process.env.TOKEN);
