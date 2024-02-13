import dedent from 'dedent-js';
import { SelectType } from '../../types/select';
import crypto from 'crypto';
import { EmbedBuilder } from 'discord.js';

export default {
    id: 'ankieta-select',
    execute: async (interaction) => {
        const [,attr] = interaction.customId.split(':');
        const [,pollId] = attr.split('^');

        const alredyVoted = await interaction.client.prisma.pollVote.findFirst({
            where: {
                pollId,
                userId: interaction.user.id
            }
        });

        if (alredyVoted) {
            await interaction.client.prisma.pollVote.update({
                where: {
                    id: alredyVoted.id
                },
                data: {
                    option: interaction.values[0]
                }
            });
        } else {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const id = crypto.randomBytes(16).toString('hex');
                const exists = await interaction.client.prisma.pollVote.findFirst({
                    where: {
                        id
                    }
                });

                if (!exists) {
                    await interaction.client.prisma.pollVote.create({
                        data: {
                            id,
                            pollId,
                            userId: interaction.user.id,
                            option: interaction.values[0]
                        }
                    });
                    break;
                }
            }
        }

        const poll = await interaction.client.prisma.poll.findFirst({
            where: {
                messageId: pollId
            }
        });

        const votes = await interaction.client.prisma.pollVote.findMany({
            where: {
                pollId
            }
        });

        const embed = interaction.message.embeds[0];
        const question = poll.question;
        const answers = poll.options;

        const votesCount = new Array(answers.length).fill(0);
        votes.forEach(vote => {
            votesCount[parseInt(vote.option) - 1]++;
        });

        const totalVotes = votesCount.reduce((a, b) => a + b, 0);

        const newEmbed = new EmbedBuilder(embed);

        newEmbed.setDescription(dedent`
            **${question}**

            ${votesCount.map((count, i) => `${i + 1}. ${answers[i]} (${count} głosów, ${((count / totalVotes) * 100).toFixed(2)}%)`).join('\n')}
        `);

        await interaction.message.edit({ embeds: [newEmbed] });

        await interaction.deferUpdate();
    }
} as SelectType;