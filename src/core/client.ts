import { ActivityType, ApplicationCommandDataResolvable, Client, Collection, Events, IntentsBitField, Partials } from 'discord.js';
import fs from 'fs';
import { CommandType } from '../types/command';
import { PrismaClient } from '@prisma/client';
import config from './config';
import { ButtonType } from '../types/button';
import { MeteorComponentType } from '../enums/components';
import { ModalType } from '../types/modal';
import { SelectType } from '../types/select';

export default class MeteorClient<Ready extends boolean = boolean> extends Client<Ready> {
	commands: Collection<string, CommandType> = new Collection();
  
	buttons: Collection<string, ButtonType> = new Collection();
	modals: Collection<string, ModalType> = new Collection();
	selectMenus: Collection<string, SelectType> = new Collection();
    boot: number = Date.now();
	color: number = 0xf53f62;
	divider: string = 'https://media.discordapp.net/attachments/1204078100283924510/1205644667736297572/divider.png?ex=65d91f18&is=65c6aa18&hm=c97b683e653f2dc35f5ffae43d9fabf46be75de816d3ba2262038189e44565c9&=&format=webp&quality=lossless&width=1440&height=33';

	prisma: PrismaClient = new PrismaClient();
    config: typeof config = config;

	constructor() {
		super({
			intents: Object.keys(IntentsBitField.Flags).map((key) => IntentsBitField.Flags[key as keyof typeof IntentsBitField.Flags]),
			partials: Object.keys(Partials).map((key) => Partials[key as keyof typeof Partials]),
			allowedMentions: {
				repliedUser: false
			},
			presence: {
				activities: [
					{
						name: 'meteorlabs.dev',
						type: ActivityType.Custom
					}
				]
			}
		});

		this.setupHooks();
	}

	private async importFile(path: string): Promise<any> {
		return (await import(path))?.default;
	}

	private async setupHooks(): Promise<void> {
		const slashCommands: ApplicationCommandDataResolvable[] = [];
		const slashCommandFolders = fs.readdirSync('./src/commands').filter((file) => !file.endsWith('.ts'));
        
		for (const folder of slashCommandFolders) {
			const slashCommandFiles = fs.readdirSync(`./src/commands/${folder}`).filter((file) => file.endsWith('.ts'));

			for (const file of slashCommandFiles) {
				const command = await this.importFile(`../commands/${folder}/${file}`);
				slashCommands.push(command.data);
				this.commands.set(command.data.name, command);
			}
		}

		const eventFolders = fs.readdirSync('./src/events').filter((file) => !file.endsWith('.ts'));

		for (const folder of eventFolders) {
			const eventFiles = fs.readdirSync(`./src/events/${folder}`).filter((file) => file.endsWith('.ts'));

			for (const file of eventFiles) {
				const event = await this.importFile(`../events/${folder}/${file}`);
				this.on(Events[event.name], event.execute);
			}
		}

		this.on('ready', async () => {
			await this.application?.commands.set(slashCommands);
		});

        const componentCategories = fs.readdirSync('./src/components').filter((file) => !file.endsWith('.ts'));

        for (const folder of componentCategories) {
            switch (folder) {
                case 'buttons': {
                    const componentFiles = fs.readdirSync(`./src/components/${folder}`).filter((file) => file.endsWith('.ts'));

                    for (const file of componentFiles) {
                        const component = await this.importFile(`../components/${folder}/${file}`);
                        this.buttons.set(component.id, Object.assign(component, { type: MeteorComponentType.Button }));
                    }

                    break;
                }

				case 'modals': {
					const componentFiles = fs.readdirSync(`./src/components/${folder}`).filter((file) => file.endsWith('.ts'));

                    for (const file of componentFiles) {
                        const component = await this.importFile(`../components/${folder}/${file}`);
                        this.modals.set(component.id, Object.assign(component, { type: MeteorComponentType.Modal }));
						console.log(file);
                    }

                    break;
				}
				
				case 'select': {
					const componentFiles = fs.readdirSync(`./src/components/${folder}`).filter((file) => file.endsWith('.ts'));

                    for (const file of componentFiles) {
                        const component = await this.importFile(`../components/${folder}/${file}`);
                        this.selectMenus.set(component.id, Object.assign(component, { type: MeteorComponentType.Select }));
						console.log(file);
                    }

                    break;
				}

                default: break;
            }
        }
	}
}