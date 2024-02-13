import { EmbedBuilder } from 'discord.js';
import { SelectType } from '../../types/select';

export default {
    id: 'selfrole-usun',
    execute: async(interaction) => {
        const panelName = interaction.customId.split(':')[1];
        const ownerId = interaction.customId.split(':')[2];
        const value = interaction.values[0];

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

        const data = await interaction.client.prisma.selfRole.findFirst({
            where: {
                roleId: value
            }
        });

        if(!data) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription('Nie znaleziono roli')
                    .setColor(interaction.client.color)
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL()
                    })
            ],
            ephemeral: true
        });

        await interaction.client.prisma.selfRole.delete({
            where: {
                id: data.id,
                panelId: panelName,
                roleId: value
            }
        });

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription('Pomyślnie usunięto rolę')
                    .setColor(interaction.client.color)
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL()
                    })
            ]
        });


    }
} as SelectType;