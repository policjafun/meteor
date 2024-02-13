import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import MeteorClient from '../core/client';

export interface CommandType {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction, client?: MeteorClient) => Promise<any>;
}