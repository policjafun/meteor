import {
    AttachmentBuilder,
    SlashCommandBuilder,
    EmbedBuilder,
} from 'discord.js';
import { CommandType } from '../../types/command';
import Canvas from 'canvas';
export default {
    data: new SlashCommandBuilder()
        .setName('canvas')
        .setDescription('canvas'),
    async execute(interaction, client) {
        try {
            await interaction.deferReply();

            const canvas = Canvas.createCanvas(1500, 675);

            let background;

            const prismaWelcome = await client.prisma.welcomeChannel.findFirst({
                where: {
                    id: interaction.guild.id,
                },
            });
            if (prismaWelcome && prismaWelcome.canvas === false) return;

            if (prismaWelcome && prismaWelcome.background) {
                const backgroundResponse = await fetch(prismaWelcome.background);
                if (!backgroundResponse.ok) {
                    background = await Canvas.loadImage(
                        './src/assets/img/welcome_background.png',
                    );
                } else {
                    background = await Canvas.loadImage(prismaWelcome.background);
                }

                background = await Canvas.loadImage(prismaWelcome.background);
            } else {
                background = await Canvas.loadImage(
                    './src/assets/img/welcome_background.png',
                );
            }

            const body = await fetch(
                interaction.user.displayAvatarURL({ extension: 'png', size: 256 }),
            ).then((res) => res.arrayBuffer());
            const avatar = await Canvas.loadImage(Buffer.from(body));
            const context = canvas.getContext('2d');

            context.drawImage(background, 0, 0, canvas.width, canvas.height);
            const textLength = interaction.user.username.length;

            let fontSize = 60;

            if (textLength > 6) {
                fontSize -= (textLength - 6) * 5;
            }

            context.font = `${fontSize}px Dela Gothic One`;
            context.fillStyle = '#e5e5e5';
            context.fillText(`${interaction.user.username}`, 99, 536);

            const circleCenterX = 237;
            const circleCenterY = canvas.height / 2;

            const avatarTopLeftY = circleCenterY - 128;
            context.beginPath();
            context.arc(circleCenterX, circleCenterY, 128, 0, Math.PI * 2, true);
            context.closePath();
            context.clip();

            context.drawImage(
                avatar,
                circleCenterX - 128,
                avatarTopLeftY,
                256,
                256,
            );

            const attachment = new AttachmentBuilder(
                canvas.toBuffer('image/png'),
                { name: 'obraz.png' },
            );

            await interaction.editReply({
                embeds: [
                    new EmbedBuilder({
                        color: client.color,
                    }).setImage('attachment://obraz.png'),
                ],
                files: [attachment],
            });
        } catch (err) {
            console.error(err);
        }
    },
} as CommandType;
