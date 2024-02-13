import { Events } from 'discord.js';

export interface EventType {
    name: keyof typeof Events;
    execute: (...args: any[]) => Promise<any>;
}