import { EventType } from '../../types/event';
import { ModalSubmitInteraction } from 'discord.js';

export default {
    name: 'InteractionCreate',
    async execute(interaction: ModalSubmitInteraction) {
        if (!interaction.isModalSubmit()) return;


        const [modalId,] = interaction.customId.split(':');
        const modal = interaction.client.modals.get(modalId);
        if (!modal) return;

        modal.execute(interaction);
    }
} as EventType;