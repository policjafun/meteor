import { client } from '../../main';
import { EventType } from '../../types/event';
import { Interaction } from 'discord.js';


export default {
	name: 'InteractionCreate',
	async execute(interaction: Interaction) {
		if (!interaction.isCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(interaction as any, client);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
} as EventType;