import { EventType } from '../../types/event';
import { ButtonInteraction } from 'discord.js';

export default {
    name: 'InteractionCreate',
    async execute(interaction: ButtonInteraction) {
        if(!interaction.isButton()) return;

        const [buttonId,] = interaction.customId.split(':');
        const button = interaction.client.buttons.get(buttonId);
        if (!button) return;

        button.execute(interaction);
    }
} as EventType;