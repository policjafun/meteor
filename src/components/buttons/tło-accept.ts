import { EmbedBuilder, Client } from 'discord.js';
import { ButtonType } from '../../types/button';

export default {
    id: 'accept_background',
    async execute(interaction) {
        const background = interaction.message.embeds.map(embed => embed.image.url)
        const guildId = interaction.message.embeds.map(embed => embed.title)
        if (!background) return interaction.reply({ content: "brak background image lol" });
        const existingBackground = await interaction.client.prisma.welcomeChannel.findFirst({
            where: {
                id: `${guildId}`
            }
        })

        if (existingBackground && existingBackground.channel) {
            await interaction.client.prisma.welcomeChannel.update({
                where: {
                    id: `${guildId}`
                },
                data: {
                    background: `${background}`
                }
            })

        } else {
            interaction.reply({ content: `Nie ma kanału w bazie danych więc nie zezwalam szkoda`})
        }


    }
} as ButtonType;