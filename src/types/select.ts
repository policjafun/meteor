import { AnySelectMenuInteraction } from 'discord.js';

export interface SelectType {
    id: string;
    execute: (interaction: AnySelectMenuInteraction) => Promise<any>;
}