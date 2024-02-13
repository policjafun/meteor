import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { CommandType } from '../../types/command';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Sprawdź status pingu bota!'),
	async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setDescription(`Serwisy naszego bota są ${client.config.emojis.online}\nW razie problemów, skontaktuj się z naszym [wsparciem](https://discord.gg/2YVWfyAtZz)!`)
            .addFields([
                {
                    name: 'Websocket',
                    value: `${client.ws.ping}ms`,
                    inline: true
                },
                {
                    name: 'Uruchomiony od',
                    value: `<t:${Math.floor(client.boot / 1000)}:R>`,
                    inline: true
                },
                {
                    name: 'WWW & Panel',
                    value: client.config.emojis.offline,
                }
            ])
            .setImage(client.divider);

        const row: any = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ping:refresh')
                    .setLabel('Odśwież')
                    .setStyle(ButtonStyle.Secondary)
            );

        const message = await interaction.reply({ embeds: [embed], components: [row] });

        const filter = i => i.customId === 'ping:refresh';
        const collector = message.createMessageComponentCollector({ filter, time: 300000 });

        collector.on('collect', async i => {
            embed.setFields([
                {
                    name: 'Websocket',
                    value: `${client.ws.ping}ms`,
                    inline: true
                },
                {
                    name: 'Uruchomiony od',
                    value: `<t:${Math.floor(client.boot / 1000)}:R>`,
                    inline: true
                },
                {
                    name: 'WWW & Panel',
                    value: client.config.emojis.offline,
                }
            ]);

            await i.update({ embeds: [embed], components: [row] });
        });

        collector.on('end', () => {
            row.setDisabled(true);
            interaction.editReply({ embeds: [embed], components: [row] });
        });
	}
} as CommandType;