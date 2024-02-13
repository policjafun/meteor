import { CommandType } from '../../types/command';
import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import dedent from 'dedent-js';

export default {
    data: new SlashCommandBuilder() 
        .setName('joinrole')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setDescription('Ustawienia roli, którą użytkownicy dostają po dołączeniu na serwer')
        .addSubcommand(subcommand =>
            subcommand
                .setName('dodaj')
                .setDescription('Wybierz role którą otrzymają nowi użytkownicy')
                .addRoleOption(option => 
                    option
                        .setName('rola')
                        .setDescription('Wybierz rolę którą otrzymają nowi użytkownicy')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('usuń')
                .setDescription('Usuń role którą otrzymują nowi użytkownicy')
                .addRoleOption(option =>
                    option
                        .setName('rola')
                        .setDescription('Usuń rolę którą otrzymują nowi użytkownicy')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('lista')
                .setDescription('Pokaż liste ról którą otrzymają nowi użytkownicy')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('wyczyść')
                .setDescription('Usuń wszystkie role z listy')
        ),
    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand();

        switch(sub) {
            case 'dodaj': {
                const role = await interaction.guild.roles.fetch(interaction.options.getRole('rola').id);

                if(!role.editable || role.managed) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color)
                            .setAuthor({
                                name: interaction.user.username,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                            .setDescription('nie można dodać roli, do której bot nie ma uprawnień lub jest zarządzana przez inną aplikację')
                    ],
                    ephemeral: true
                });

                if(role) {
                    let data = await client.prisma.joinRole.findMany({
                        where: {
                            guildId: interaction.guild.id,
                        }
                    });

                    const exists = data.some((r) => r.roleId === role.id);

                    if(exists) {
                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(client.color)
                                    .setAuthor({
                                        name: interaction.user.username,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })
                                    .setDescription(
                                        `rola <@&${role.id}> jest już dodana do listy`
                                    )
                            ]
                        });
                    } else {
                        await client.prisma.joinRole.create({
                            data: {
                                guildId: interaction.guild.id,
                                roleId: role.id
                            }
                        });

                        data = await client.prisma.joinRole.findMany({
                            where: {
                                guildId: interaction.guild.id,
                            }
                        });

                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(client.color)
                                    .setAuthor({
                                        name: interaction.user.username,
                                        iconURL: interaction.user.displayAvatarURL()
                                    })
                                    .setDescription(
                                        dedent`
                                            pomyślnie dodano rolę do listy

                                            aktualna lista:
                                            ${
                                                data.map(r => {
                                                    return `- <@&${r.roleId}>${
                                                        r.roleId === role.id ? ' *(nowa rola)*' : ''
                                                    }`;
                                                })
                                                    .join('\n')
                                            }
                                        `
                                    )
                                    .setImage(client.divider)
                            ]
                        });
                    }
                }
            } break;
            case 'usuń': {
                const role = interaction.options.getRole('rola');

                const data = await client.prisma.joinRole.findMany({
                    where: {
                        guildId: interaction.guild.id,
                    }
                });

                const exists = data.some((r) => r.roleId === role.id);

                if(exists) {
                    await client.prisma.joinRole.delete({
                        where: {
                            guildId: interaction.guild.id,
                            roleId: role.id
                        }
                    });
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(client.color)
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL()
                                })
                                .setDescription('pomyślnie usunięto rolę z listy')
                        ],
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(client.color)
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL()
                                })
                                .setDescription('ta rola nie jest na liście')
                        ],
                        ephemeral: true
                    });
                }
            } break;
            case 'lista': {
                const data = await client.prisma.joinRole.findMany({
                    where: {
                        guildId: interaction.guild.id,
                    }
                });

                if(data.length !== 0) {
                    const roles = data.map((role) => `- <@&${role.roleId}>`);

                    const embed = new EmbedBuilder()
                        .setColor(client.color)
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                        .setDescription(dedent`
                            lista ról dla nowych użytkowników:\n
                            ${roles.join('\n')}
                        `)
                        .setImage(client.divider);

                    await interaction.reply({ embeds: [embed] });
                } else {
                    const embed = new EmbedBuilder()
                        .setColor(client.color)
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                        .setDescription('na tym serwerze join role nie są skonfigurowane, zrób to za pomocą */joinrole dodaj*');
                    
                    await interaction.reply({ embeds: [embed] });
                }
            } break;
            case 'wyczyść': {
                if (await client.prisma.joinRole.findFirst({
                    where: {
                        guildId: interaction.guild.id
                    }
                }) === null) {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(client.color)
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL()
                                })
                                .setDescription('na tym serwerze join role nie są skonfigurowane, zrób to za pomocą */joinrole dodaj*')
                        ]
                    });
                }

                await client.prisma.joinRole.deleteMany({
                    where: {
                        guildId: interaction.guild.id
                    }
                });

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color)
                            .setAuthor({
                                name: interaction.user.username,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                            .setDescription('pomyślnie usunięto wszystkie role z listy')
                    ]
                });
            } break;
        }
    }
} as CommandType;