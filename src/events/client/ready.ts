import { EventType } from '../../types/event';
import { Client, TextChannel } from 'discord.js';

export default {
    name: 'ClientReady',
    async execute(client: Client) {
        console.log(`Logged in as ${client.user?.tag}!`);

        const channel = await client.channels.fetch('1205914106117496902') as TextChannel;


        console.log(client.guilds.cache.map(m => m.name));
  
      
        ['uncaughtException', 'unhandledRejection'].forEach((event) => {
            process.on(event, (error) => {
                channel.send(`\`\`\`js\n${error.stack}\`\`\``);
                console.log(error);
            });
        });
    }
} as EventType;