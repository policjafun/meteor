import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';
import { ButtonType } from '../../types/button';

export default {
    id: 'ankieta-close',
    async execute(interaction) {
        const [,attr] = interaction.customId.split(':');
        const [userId, messageId] = attr.split('^');

        const poll = await interaction.client.prisma.poll.findFirst({
            where: {
                messageId: messageId
            }
        });

        if (!poll) {
            return await interaction.reply({
                content: 'Nie znaleziono ankiety',
                ephemeral: true
            });
        }

        const member = await interaction.guild.members.fetch(userId);

        if (poll.creatorId !== userId || !member.permissions.has('ManageMessages')) {
            return await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(interaction.client.color)
                        .setDescription('Nie masz uprawnień do zakończenia tej ankiety')
                        .setAuthor({
                            name: interaction.user.username,
                            iconURL: interaction.user.displayAvatarURL()
                        })
                ],
                ephemeral: true
            });
        }

        const row: any = new ActionRowBuilder()
            .setComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ankieta-closed')
                    .setDisabled(true)
                    .setPlaceholder(`Ankieta zakończona przez ${interaction.user.username}`)
                    .setOptions(
                        [
                            {
                                label: `Ankieta zakończona przez ${interaction.user.username}`,
                                value: 'closed'
                            }
                        ]
                    )
            );

        await interaction.update({
            components: [row]
        });
    }
} as ButtonType;