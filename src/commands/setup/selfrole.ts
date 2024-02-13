import { ActionRowBuilder, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, StringSelectMenuBuilder } from 'discord.js';
import { CommandType } from '../../types/command';
import dedent from 'dedent-js';

export default {
    data: new SlashCommandBuilder()
        .setName('selfrole')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setDescription('Zarządzaj panelami dla autoroli')
        .addSubcommand(subcommand =>
            subcommand
                .setName('stworz')
                .setDescription('Stwórz nowy panel dla selfroli')
                .addStringOption(option =>
                    option
                        .setName('nazwa')
                        .setDescription('Nazwa panelu')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('usun')
                .setDescription('Usuń panel dla selfroli')
                .addStringOption(option =>
                    option
                        .setName('nazwa')
                        .setDescription('Nazwa panelu')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('edytuj')
                .setDescription('Edytuj panel dla selfroli')
                .addStringOption(option =>
                    option
                        .setName('nazwa')
                        .setDescription('Nazwa panelu')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('lista')
                .setDescription('Wyświetl listę paneli dla selfroli')
        ),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        switch(sub) {
            case 'stworz': {
                const name = interaction.options.getString('nazwa');

                const embed = new EmbedBuilder()
                    .setColor(interaction.client.color)
                    .setImage(interaction.client.divider)
                    .setDescription(dedent`
                        Pomyślnie stworzono panel selfroli o nazwie \`${name}\`

                        Aby zarządzać panelem, wybierz przyciski na dole.
                    `);

                await interaction.client.prisma.selfRolePanel.create({
                    data: {
                        guildId: interaction.guild.id,
                        panelDisplayName: name,
                        panelId: name
                    }
                });

                const row: any = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(`selfrole-stworz:${name}:${interaction.user.id}`)
                            .setPlaceholder('Wybierz akcję')
                            .setOptions([
                                {
                                    label: 'Dodaj rolę',
                                    description: 'Dodaj rolę do panelu',
                                    value: 'dodaj'
                                },
                                {
                                    label: 'Usuń rolę',
                                    description: 'Usuń rolę z panelu',
                                    value: 'usun'
                                },
                                {
                                    label: 'Lista ról',
                                    description: 'Wyświetl listę ról w panelu',
                                    value: 'lista'
                                },
                                {
                                    label: 'Wyślij panel',
                                    description: 'Wyślij panel na kanał',
                                    value: 'wyslij'
                                },
                                {
                                    label: 'Anuluj',
                                    description: 'Anuluj tworzenie panelu',
                                    value: 'anuluj'
                                }
                            ])
                            
                    );

                await interaction.reply({
                    embeds: [embed],
                    components: [row]
                });
                    
            } break;
            case 'usun': {
                const name = interaction.options.getString('nazwa');

                const data = interaction.client.prisma.selfRole.findFirst({
                    where: {
                        panelId: name
                    }
                });

                if(!data) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription('Nie znaleziono panelu')
                            .setColor(interaction.client.color)
                            .setAuthor({
                                name: interaction.user.username,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                    ],
                    ephemeral: true
                });

                await interaction.client.prisma.selfRole.deleteMany({
                    where: {
                        panelId: name
                    }
                });

                await interaction.client.prisma.selfRolePanel.delete({
                    where: {
                        panelId: name
                    }
                });

                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription('Pomyślnie usunięto panel')
                            .setColor(interaction.client.color)
                            .setAuthor({
                                name: interaction.user.username,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                    ]
                });
            } break;
            case 'lista': {
                const data = await interaction.client.prisma.selfRolePanel.findMany({
                    where: {
                        guildId: interaction.guild.id
                    }
                });

                if(!data.length) return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription('Nie znaleziono paneli')
                            .setColor(interaction.client.color)
                            .setAuthor({
                                name: interaction.user.username,
                                iconURL: interaction.user.displayAvatarURL()
                            })
                    ],
                    ephemeral: true
                });

                const embed = new EmbedBuilder()
                    .setColor(interaction.client.color)
                    .setImage(interaction.client.divider)
                    .setDescription(dedent`
                        Lista paneli dla selfroli

                        ${data.map((d, i) => `**${i + 1}.** ${d.panelId}`).join('\n')}
                    `);

                await interaction.reply({
                    embeds: [embed]
                });
            } break;
        }
    }
} as CommandType;