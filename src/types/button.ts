import { ButtonInteraction } from 'discord.js';

export interface ButtonType {
    id: string;
    execute: (interaction: ButtonInteraction) => Promise<any>;
}