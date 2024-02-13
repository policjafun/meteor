import dedent from 'dedent-js';
import { EventType } from '../../types/event';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, TextChannel } from 'discord.js';

export default {
    name: 'GuildCreate',
    async execute(guild: Guild) {
  
        const owner = await guild.fetchOwner();

        const embed = new EmbedBuilder()
            .setColor(guild.client.color)
            .setImage(guild.client.divider)
            .setDescription(dedent`
                dodano bota na serwer **${guild.name}**

                właściciel: ${owner.user.username} (${owner.user.id})
                użytkownicy: ${guild.memberCount}
                utworzono

                aktualna liczba serwerów: ${guild.client.guilds.cache.size}
            `);

        const channel = await guild.client.channels.fetch('1205916168746180761') as TextChannel;

        const row: any = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`leave:${guild.id}`)
                    .setLabel('Opuść serwer')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(guild.client.config.emojis.leave)
            );

        channel.send({ embeds: [embed], components: [row] });
    }
} as EventType;