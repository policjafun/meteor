import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { CommandType } from '../../types/command';
import ms from 'ms';
import dedent from 'dedent-js';

/**
model UserTasks {
    id String @id

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    userId String
    tasks  Task[]
}

model Task {
    id String @id

    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt

    name        String
    description String?
    completed   Boolean
    dueDate     DateTime?

    userTasksId String
    UserTasks   UserTasks @relation(fields: [userTasksId], references: [id])
}
 */

export default {
    data: new SlashCommandBuilder()
        .setName('zadania')
        .setDescription('Zarządzaj swoimi zadaniami łatwo i wygodnie')
        .addSubcommand(subcommand =>
            subcommand
                .setName('stwórz')
                .setDescription('Stwórz nowe zadanie')
                .addStringOption(option =>
                    option
                        .setName('nazwa')
                        .setDescription('Nazwa zadania')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('opis')
                        .setDescription('Opis zadania')
                )
                .addStringOption(option =>
                    option
                        .setName('termin')
                        .setDescription('Termin wykonania zadania')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('usuń')
                .setDescription('Usuń zadanie')
                .addIntegerOption(option =>
                    option
                        .setName('id')
                        .setDescription('ID zadania')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('lista')
                .setDescription('Wyświetl interaktywną listę zadań')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('edytuj')
                .setDescription('Edytuj zadanie')
                .addIntegerOption(option =>
                    option
                        .setName('id')
                        .setDescription('ID zadania')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('nazwa')
                        .setDescription('Nazwa zadania')
                )
                .addStringOption(option =>
                    option
                        .setName('opis')
                        .setDescription('Opis zadania')
                )
                .addStringOption(option =>
                    option
                        .setName('termin')
                        .setDescription('Termin wykonania zadania (za ile czasu, np. 1d, 1h, 1m)')
                )
                .addBooleanOption(option =>
                    option
                        .setName('zakończone')
                        .setDescription('Czy zadanie jest zakończone?')
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('sprawdź')
                .setDescription('Sprawdź szczegóły zadania')
                .addIntegerOption(option =>
                    option
                        .setName('id')
                        .setDescription('ID zadania')
                        .setRequired(true)
                )
        ),

    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            });

        switch (interaction.options.getSubcommand()) {
            case 'stwórz': {
                const name = interaction.options.getString('nazwa');
                const description = interaction.options.getString('opis');
                const dueDate = interaction.options.getString('termin');

                const dueDateParsed = dueDate ? (
                    new Date(ms(dueDate) + Date.now())
                ) : null;

                if (!await client.prisma.userTasks.findUnique({
                    where: {
                        userId: interaction.user.id
                    }
                })) {
                    await client.prisma.userTasks.create({
                        data: {
                            userId: interaction.user.id
                        }
                    });
                }

                await client.prisma.task.create({
                    data: {
                        name,
                        description,
                        dueDate: dueDateParsed,
                        userTasksId: interaction.user.id,
                        completed: false
                    }
                });

                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setImage(client.divider)
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(dedent`
                        pomyślnie stworzono zadanie

                        nazwa: ${name}
                        opis: ${description || 'brak'}
                        status: ${client.config.emojis.w_trakcie}
                        termin: <t:${Math.floor(dueDateParsed.getTime() / 1000)}:R>
                        stworzone: <t:${Math.floor(Date.now() / 1000)}:R>
                    `);

                await interaction.reply({ embeds: [embed] });
            } break;
            case 'usuń': {
                const id = interaction.options.getString('id');

                const task = await client.prisma.task.findUnique({
                    where: {
                        id
                    }
                });

                if (!task) {
                    return interaction.reply({
                        embeds: [embed.setDescription('nie znaleziono zadania o podanym ID')],
                        ephemeral: true
                    });
                }

                if (task.userTasksId !== interaction.user.id) {
                    return interaction.reply({
                        embeds: [embed.setDescription('nie możesz usunąć zadania, które nie należy do Ciebie')],
                        ephemeral: true
                    });
                }

                await client.prisma.task.delete({
                    where: {
                        id
                    }
                });

                const embed_ = new EmbedBuilder()
                    .setColor(client.color)
                    .setImage(client.divider)
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(dedent`
                        pomyślnie usunięto zadanie
                    `);

                await interaction.reply({ embeds: [embed_] });
            } break;
            case 'lista': {
                let tasks = await client.prisma.task.findMany({
                    where: {
                        userTasksId: interaction.user.id
                    }
                });

                tasks = tasks.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

                if (!tasks.length) {
                    return interaction.reply({
                        embeds: [embed.setDescription('nie masz żadnych zadań')],
                        ephemeral: true
                    });
                }

                const list = tasks.map((task, index) => {
                    return `${index + 1}. ${task.name} ${task.completed ? client.config.emojis.skonczone : client.config.emojis.w_trakcie}${task.dueDate ? ` *(termin: <t:${Math.floor(task.dueDate.getTime() / 1000)}:R>)*` : ''}`;
                });

                embed.setDescription(list.join('\n'));
                await interaction.reply({ embeds: [embed] });
            } break;
            case 'edytuj': {
                const id = interaction.options.getInteger('id');
                const name = interaction.options.getString('nazwa');
                const description = interaction.options.getString('opis');
                const dueDate = interaction.options.getString('termin');
                const completed = interaction.options.getBoolean('zakończone');

                let tasks = await client.prisma.task.findMany({
                    where: {
                        userTasksId: interaction.user.id
                    }
                });

                tasks = tasks.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

                if (!tasks.length) {
                    return interaction.reply({
                        embeds: [embed.setDescription('nie masz żadnych zadań')],
                        ephemeral: true
                    });
                }

                if (tasks.length < id) {
                    return interaction.reply({
                        embeds: [embed.setDescription('nie znaleziono zadania o podanym ID')],
                        ephemeral: true
                    });
                }

                const task = tasks[id - 1];

                const data = {
                    name: name || task.name,
                    description: description || task.description,
                    dueDate: dueDate ? new Date(ms(dueDate) + Date.now()) : task.dueDate,
                    completed: completed ?? task.completed
                };

                await client.prisma.task.update({
                    where: {
                        id: task.id
                    },
                    data
                });

                const embed_ = new EmbedBuilder()
                    .setColor(client.color)
                    .setImage(client.divider)
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(dedent`
                        pomyślnie edytowano zadanie

                        nazwa: ${data.name}
                        opis: ${data.description || 'brak'}
                        status: ${data.completed ? client.config.emojis.skonczone : client.config.emojis.w_trakcie}
                        termin: ${data.dueDate ? `<t:${Math.floor(data.dueDate.getTime() / 1000)}:R>` : 'brak'}
                        stworzone: <t:${Math.floor(task.createdAt.getTime() / 1000)}:R>
                    `);

                await interaction.reply({ embeds: [embed_] });
            } break;

            case 'sprawdź': {
                const id = interaction.options.getInteger('id');

                let tasks = await client.prisma.task.findMany({
                    where: {
                        userTasksId: interaction.user.id
                    }
                });

                tasks = tasks.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

                if (!tasks.length) {
                    return interaction.reply({
                        embeds: [embed.setDescription('nie masz żadnych zadań')],
                        ephemeral: true
                    });
                }

                if (tasks.length < id) {
                    return interaction.reply({
                        embeds: [embed.setDescription('nie znaleziono zadania o podanym ID')],
                        ephemeral: true
                    });
                }

                const task = tasks[id - 1];

                const embed_ = new EmbedBuilder()
                    .setColor(client.color)
                    .setImage(client.divider)
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(dedent`
                        nazwa: ${task.name}
                        opis: ${task.description || 'brak'}
                        status: ${task.completed ? client.config.emojis.skonczone : client.config.emojis.w_trakcie}
                        termin: ${task.dueDate ? `<t:${Math.floor(task.dueDate.getTime() / 1000)}:R>` : 'brak'}
                        stworzone: <t:${Math.floor(task.createdAt.getTime() / 1000)}:R>
                    `);

                await interaction.reply({ embeds: [embed_] });
            } break;
        }
    }

} as CommandType;