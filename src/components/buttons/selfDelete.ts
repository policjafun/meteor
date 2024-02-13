import { EmbedBuilder } from 'discord.js';
import { ButtonType } from '../../types/button';

export default {
    id: 'selfDelete',
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(interaction.client.color)
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            });

        const [,attr] = interaction.customId.split(':');
        const [mode, ownerId] = attr.split('^');

        if (mode === 'ownerOnly') {
            if (interaction.user.id !== ownerId) {
                embed.setDescription('Nie jesteś właścicielem tego przycisku.');
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                if (interaction.message.deletable) await interaction.message.delete();
                else {
                    embed.setDescription('Nie mam uprawnień do usunięcia tej wiadomości.');
                    return await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }
        } else if (mode === 'permsAllowed') {
            const member = await interaction.guild.members.fetch(interaction.user.id);

            if (!member.permissions.has('ManageMessages')) {
                embed.setDescription('Nie masz uprawnień do usunięcia tej wiadomości.');
                return await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                if (interaction.message.deletable) await interaction.message.delete();
                else {
                    embed.setDescription('Nie mam uprawnień do usunięcia tej wiadomości.');
                    return await interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }
        }
    }
} as ButtonType;