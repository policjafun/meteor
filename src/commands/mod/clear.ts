import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CommandType } from '../../types/command';

export default {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Czyści czat z wiadomości.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(option => option.setName('ilość').setDescription('Ilość wiadomości do usunięcia').setRequired(true)),

    async execute(interaction, client) {
        const amount = interaction.options.getInteger('ilość');

        const beforeEmbed = new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setDescription('Usuwanie wiadomości...');

        await interaction.reply({ embeds: [beforeEmbed], ephemeral: true });

        try {
            let deleted = 0;

            if (amount == 0) return;
            if (amount > 400) {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription('Nie można usunąć więcej niż 400 wiadomości na raz.');

                return await interaction.editReply({ embeds: [embed] });
            }

            if (amount <= 100) {
                await interaction.channel.bulkDelete(amount);
                deleted = amount;
            } else {
                const rounds = Math.ceil(amount / 100);
                for (let i = 0; i < rounds; i++) {
                    const messagesToBulkDelete = Math.min(100, amount - i * 100);
                    await interaction.channel.bulkDelete(messagesToBulkDelete)
                        .then((d) => {
                            if (d.size != 0) deleted += d.size;
                            else i = rounds;
                        })
                        .catch(() => {
                            i = rounds;
                        });
                }
            }

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setDescription(`Usunięto ${deleted} wiadomości.`);

            await interaction.editReply({ embeds: [embed] })
                .catch(() => {});

            const publicEmbed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setDescription(`${interaction.user} usunął ${deleted} wiadomości z tego kanału.`);

            const row: any = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`selfDelete:permsAllowed^${interaction.user.id}`)
                        .setLabel('Usuń tę wiadomość')
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.channel.send({ embeds: [publicEmbed], components: [row] });
        } catch (e) {
            console.log(e);
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setDescription('Bot nie jest w stanie wykonać tej operacji, ponieważ nie posiada odpowiednich uprawnień.');

            await interaction.editReply({ embeds: [embed] })
                .catch(() => {});
        }
    }
} as CommandType;