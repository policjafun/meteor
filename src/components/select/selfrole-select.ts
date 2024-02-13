import { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle, EmbedBuilder, StringSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType } from 'discord.js';
import { SelectType } from '../../types/select';
import dedent from 'dedent-js';

export default {
    id: 'selfrole-stworz',
    execute: async (interaction) => {
        const value = interaction.values[0];
        const panelName = interaction.customId.split(':')[1];

        if(interaction.user.id !== interaction.customId.split(':')[2]) {
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(interaction.client.color)
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                        .setDescription('Nie jesteś właścicielem tego panelu')
                ],
                ephemeral: true
            });
            return;
        }



        switch(value) {
            case 'dodaj': {
                const modal = new ModalBuilder()
                    .setTitle('Informacje na temat roli')
                    .setCustomId(`selfrole-stworz-dodaj:${panelName}`);

                const roleName = new TextInputBuilder()
                    .setLabel('Nazwa roli')
                    .setCustomId('roleName')
                    .setPlaceholder('Nazwa roli lub jej Id')
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);

                const roleDescription = new TextInputBuilder()
                    .setLabel('Opis roli')
                    .setCustomId('roleDescription')
                    .setPlaceholder('Opis roli')
                    .setRequired(false)
                    .setStyle(TextInputStyle.Short);

                const roleEmoji = new TextInputBuilder()
                    .setLabel('Emoji')
                    .setCustomId('roleEmoji')
                    .setPlaceholder('Emoji')
                    .setRequired(false)
                    .setStyle(TextInputStyle.Short);

                modal.addComponents(
                    new ActionRowBuilder<TextInputBuilder>()
                        .addComponents(roleName),
                    new ActionRowBuilder<TextInputBuilder>()
                        .addComponents(roleDescription),
                    new ActionRowBuilder<TextInputBuilder>()
                        .addComponents(roleEmoji)
                );

                await interaction.showModal(modal);
            } break;
            case 'usun': {
                const roles = await interaction.client.prisma.selfRole.findMany({
                    where: {
                        panelId: panelName
                    }
                });

                if(!roles.length) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(dedent`
                                    Nie znaleziono żadnych roli w tym panelu
                                `)
                        ]
                    });
                } else {
                    const menu = new StringSelectMenuBuilder()
                        .setCustomId(`selfrole-usun:${panelName}:${interaction.user.id}`)
                        .setPlaceholder('Wybierz role do usunięcia.');

                    roles.forEach(async (role) => {
                        menu.addOptions([
                            {
                                label: interaction.guild.roles.cache.get(role.roleId).name,
                                value: role.roleId
                            }
                        ]);
                    });

                    const row: any = new ActionRowBuilder()
                        .addComponents(menu);

                    interaction.reply({ components: [row] });
                }

            } break;
            case 'lista': {
                const roles = await interaction.client.prisma.selfRole.findMany({
                    where: {
                        panelId: panelName
                    }
                });

                if(!roles.length) {
                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(interaction.client.color)
                                .setDescription(dedent`
                                    Nie znaleziono żadnych roli w tym panelu
                                `)
                        ]
                    });
                } else {
                    const embed = new EmbedBuilder()
                        .setColor(interaction.client.color)
                        .setDescription(dedent`
                            oto lista wszystkich ról w panelu:

                            ${roles.map((role) => `* <@&${role.roleId}>`).join('\n')}
                            
                        `);

                    interaction.reply({ embeds: [embed] });
                } 
            } break;
            case 'wyslij': {
                const menu = new ChannelSelectMenuBuilder()
                    .setChannelTypes(ChannelType.GuildText)
                    .setCustomId(`selfrole-wyslij:${panelName}:${interaction.user.id}`)
                    .setPlaceholder('Wybierz kanał');

                const row: any = new ActionRowBuilder()
                    .addComponents(menu);

                interaction.reply({ components: [row] });
            } break;
            case 'anuluj': {
                const data = interaction.client.prisma.selfRolePanel.findFirst({
                    where: {
                        panelId: panelName
                    }
                });

                if(data) {
                    await interaction.client.prisma.selfRolePanel.delete({
                        where: {
                            panelId: panelName
                        }
                    });
                } else {
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription('Nie znaleziono panelu')
                                .setColor(interaction.client.color)
                        ]
                    });
                }

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription('Pomyślnie anulowano tworzenie panelu')
                            .setColor(interaction.client.color)
                    ]
                });

                interaction.message.delete();

            } break;
        }
    }
} as SelectType;
