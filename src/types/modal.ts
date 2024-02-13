import { ModalSubmitInteraction } from 'discord.js';

export interface ModalType {
    id: string;
    execute: (interaction: ModalSubmitInteraction) => Promise<any>;
}