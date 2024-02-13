import 'dotenv/config';

import MeteorClient from './core/client';
import { Collection } from 'discord.js';
import { CommandType } from './types/command';
import { ButtonType } from './types/button';
import { ModalType } from './types/modal';
import { SelectType } from './types/select';
import { PrismaClient } from '@prisma/client';
import config from './core/config';

export const client = new MeteorClient();

client.login(process.env.TOKEN!);
declare module 'discord.js' {
    interface Client {
        commands: Collection<string, CommandType>;
        prisma: PrismaClient;
        color: number;
        divider: string;
        boot: number;
        config: typeof config;
        buttons: Collection<string, ButtonType>;
        modals: Collection<string, ModalType>;
        selectMenus: Collection<string, SelectType>;
    }
}