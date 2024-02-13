import { EventType } from '../../types/event';
import { AnySelectMenuInteraction } from 'discord.js';

export default {
    name: 'InteractionCreate',
    async execute(interaction: AnySelectMenuInteraction) {
        if (!interaction.isAnySelectMenu()) return;

        const [selectId,] = interaction.customId.split(':');
        const select = interaction.client.selectMenus.get(selectId);
        if (!select) return;

        select.execute(interaction);
    }
} as EventType;