import { ChatInputCommandInteraction, Client, GatewayIntentBits, Snowflake } from 'discord.js'
import * as dotenv from 'dotenv';
    dotenv.config()
import Queue from './Classes/Queue';
import RunCommand, { RegisterCommands } from './Core/Commands';
import Configurations from './Core/Configurations';
import onChannelChange from './Events/onChannelChange';

export type RFClient = Client & {
    queueMap: Map<Snowflake, Queue>,
    findQueue: (guildId: Snowflake, channelId: Snowflake) => Queue,
}

const client = new Client({ intents: [ GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers ] }) as RFClient

client.on('ready', async () => {

    console.debug(`Logged in as ${client.user?.username}!`)

    // Register the commands
    await RegisterCommands(client)

    // Set the Queue Map
    client.queueMap = new Map<Snowflake, Queue>() // Queues are added to the map on voice channel join.
    client.findQueue = (guildId: Snowflake, channelId: Snowflake) => { // If we're not sure a queue exists, this is a safe way to fetch it

        const queue = client.queueMap.get(guildId)

        if (queue) {

            return queue

        } else {

            const newQueue = new Queue(guildId, channelId)
            client.queueMap.set(guildId, newQueue)
            return newQueue

        }

    }


    client.on('interactionCreate', async (interaction) => {
        
        if (interaction.inGuild()) {

            if (interaction.isChatInputCommand()){
    
                await RunCommand(client, interaction as ChatInputCommandInteraction).catch((err) => { throw err; })
    
            }

            /*(if (interaction.isButton()) {

                await onButton(interaction, client).catch((err) => { throw err; })

            }*/

        }

    })


    // Listen for voice channel changes
    client.on('voiceStateUpdate', (oldState, newState) => {

        if (newState.member.user.id === client.user.id) {

            onChannelChange(client, oldState, newState)

        } else {

            // Insert Private Voice Channel Feature Here

        }
        
    })

})

client.login(process.env.TOKEN);
