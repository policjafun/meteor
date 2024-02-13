import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { CommandType } from '../../types/command';
import dedent from 'dedent-js';

export default {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Sprawdź status i informacje o bocie.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('bot')
                .setDescription('Informacje o bocie.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('Informacje o serwerze.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Informacje o użytkowniku.')
                .addUserOption(option =>
                    option
                        .setName('użytkownik')
                        .setDescription('Użytkownik, o którym chcesz uzyskać informacje.')
                )
        ),
    async execute(interaction, client) {
        switch (interaction.options.getSubcommand()) {
            case 'bot': {
                const users = client.users.cache.size;
                const guilds = client.guilds.cache.size;

                const developerRole = '1204077231702544454';
                const developerGuild = '1203799913855586355';
                const developers = client.guilds.cache.get(developerGuild).roles.cache.get(developerRole).members.map(m => m.user.id);

                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setImage(client.divider)
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(dedent`
                        [\`Dodaj bota\`](https://discord.com/oauth2/authorize?client_id=1204521878241419324&permissions=8&scope=bot) | [\`Serwer wsparcia\`](https://discord.gg/2YVWfyAtZz) | [\`Strona bota\`](https://meteorlabs.dev/)
                        
                        użytkownicy: ${users}
                        serwery: ${guilds}

                        **Twórcy:**
                        ${developers.map(id => `<@${id}>`).join(', ')}
                        `);

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'server': {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setImage(client.divider)
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setDescription(dedent`
                        ${client.config.emojis.boost} ${interaction.guild.premiumSubscriptionCount > 0 ? `${interaction.guild.premiumTier} poziom ulepszeń **(${interaction.guild.premiumSubscriptionCount})**` : 'Brak ulepszeń'}\n
                        id: ${interaction.guild.id}

                        właściciel: <@${interaction.guild.ownerId}>
                        utworzony: <t:${Math.floor(interaction.guild.createdTimestamp / 1000)}:R>
                        użytkownicy: ${interaction.guild.memberCount}

                        ikona: [link](${interaction.guild.iconURL()})
                        vanity: ${interaction.guild.vanityURLCode ? `discord.gg/${interaction.guild.vanityURLCode}` : 'brak'}
                    `);

                await interaction.reply({ embeds: [embed] });
                break;
            }

            case 'user': {
                const user = interaction.options.getUser('użytkownik') || interaction.user;
                const member = interaction.guild.members.cache.get(user.id);

                let final: string;

                if (member) {
                    const roles = member.roles.cache
                        .filter(r => r.id !== interaction.guild.id)
                        .sort((a, b) => b.position - a.position)
                        .map(r => r.toString());

                    final = roles.slice(0, 5).join(', ');
                    if (roles.length > 5) {
                        final += ` **(+${roles.length - 5})**`;
                    }

                    final += '\n\n';
                }

                final += dedent`
                    id: ${user.id}
                    nick (@): ${user.username}
                    wspólne serwery: ${client.guilds.cache.filter(g => g.members.cache.has(user.id)).size}
                    avatar: [link](${user.displayAvatarURL()})
                    
                    utworzony: <t:${Math.floor(user.createdTimestamp / 1000)}:R>\n
                `;

                if (member) {
                    final += dedent`
                        dołączył: <t:${Math.floor(member.joinedTimestamp / 1000)}:R>
                        pozycja dołączenia: ${member.guild.members.cache.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp).map(m => m.id).indexOf(member.id) + 1}/${member.guild.memberCount}
                    `;
                }

                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setImage(client.divider)
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setThumbnail(user.displayAvatarURL())
                    .setDescription(final);

                await interaction.reply({ embeds: [embed] });
                break;
            }
        }
    }
} as CommandType;