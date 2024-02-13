import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { CommandType } from '../../types/command';
import dedent from 'dedent-js';

export default {
    data: new SlashCommandBuilder()
        .setName('ankieta')
        .setDescription('Tworzy ankietę')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option => option
            .setName('pytanie')
            .setDescription('Treść pytania')
            .setRequired(true))
        .addStringOption(option => option
            .setName('odpowiedzi')
            .setDescription('Odpowiedzi oddzielone przecinkami (np. "tak, nie, może")')
            .setRequired(true)),
    async execute(interaction) {
        const question = interaction.options.getString('pytanie');
        const answers = interaction.options.getString('odpowiedzi').split(',');
        answers.forEach((a, i) => {
            answers[i] = a.trim();
        });

        const embed = new EmbedBuilder()
            .setColor(interaction.client.color)
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            });

        if (answers.length < 2) {
            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    embed
                        .setDescription('Ankieta musi zawierać co najmniej 2 odpowiedzi')
                ]
            });
        }

        if (answers.length > 25) {
            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    embed
                        .setDescription('Ankieta może zawierać maksymalnie 25 odpowiedzi')
                ]
            });
        }

        if (answers.some(a => a.trim() === '')) {
            return await interaction.reply({
                ephemeral: true,
                embeds: [
                    embed
                        .setDescription('Odpowiedzi nie mogą być puste')
                ]
            });
        }

        const msg_ = await interaction.reply({
            content: 'Tworzenie ankiety...'
        });

        embed
            .setImage(interaction.client.divider)
            .setDescription(dedent`
                **${question}**

                ${answers.map((a, i) => `${i + 1}. ${a} (0 głosów, 0%)`).join('\n')}
            `);

        const select = new StringSelectMenuBuilder()
            .setPlaceholder('Wybierz odpowiedź')
            .setCustomId(`ankieta-select:${interaction.user.id}^${msg_.id}`);

        for (let i = 0; i < answers.length; i++) {
            select.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(`${i + 1}. ${answers[i]}`)
                    .setValue(`${i + 1}`)
            );
        }

        const row: any = new ActionRowBuilder()
            .addComponents(select);

        const poll = {
            messageId: msg_.id,
            creatorId: interaction.user.id,
            channelId: interaction.channelId,
            guildId: interaction.guildId,
            question,
            options: answers
        };

        const actionRow: any = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`ankieta-close:${interaction.user.id}^${msg_.id}`)
                    .setLabel('Zakończ ankietę')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(interaction.client.config.emojis.trash)
            );

        await msg_.edit({ content: '', embeds: [embed], components: [row, actionRow] });


        await interaction.client.prisma.poll.create({ data: poll });
    }
} as CommandType;