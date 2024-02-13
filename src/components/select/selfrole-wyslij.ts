import { ActionRowBuilder, ChannelType, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';
import { SelectType } from '../../types/select';

export default {
    id: 'selfrole-wyslij',
    execute: async (interaction) => {
        const panelName = interaction.customId.split(':')[1];
        const ownerId = interaction.customId.split(':')[2];
        const value = interaction.values[0];

        const panel = await interaction.client.prisma.selfRolePanel.findFirst({
            where: {
                panelId: panelName
            },
            include: {
                roles: true
            }
        });

        if(!panel) return;

        if(interaction.user.id !== ownerId) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(interaction.client.color)
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription('Nie jesteś właścicielem tej interakcji')
            ],
            ephemeral: true
        });

        const channel = await interaction.guild.channels.fetch(value);

        if(channel.type !== ChannelType.GuildText) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(interaction.client.color)
                    .setDescription('Kanał musi być kanałem tekstowym')
            ],
            ephemeral: true
        });

        const embed = new EmbedBuilder()
            .setColor(interaction.client.color)
            .setDescription(`Panel ${panel.panelDisplayName} został wysłany na kanał ${channel}`);

        const panelEmbed = new EmbedBuilder()
            .setDescription(panel.panelDisplayName)
            .setColor(interaction.client.color);

        const menu = new StringSelectMenuBuilder()
            .setCustomId(`selfrole-panel:${panel.panelId}`)
            .setPlaceholder('Wybierz rolę')
            .setMinValues(1)
            .setMaxValues(panel.roles.length);

        if(panel.roles.length == 0) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(interaction.client.color)
                    .setDescription('Panel nie posiada żadnych ról.')
            ],
            ephemeral: true
        });

        for(const role of panel.roles) {
            menu.addOptions({
                label: interaction.guild.roles.cache.get(role.roleId).name,
                value: role.roleId
            });
        }

        const row: any = new ActionRowBuilder()
            .addComponents(menu);

        interaction.reply({ embeds: [embed], ephemeral: true });
        channel.send({ embeds: [panelEmbed], components: [row] });
    }
} as SelectType;