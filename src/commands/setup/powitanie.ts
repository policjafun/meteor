import {
    SlashCommandBuilder,
    EmbedBuilder,
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    TextChannel,
} from "discord.js";
import { CommandType } from "../../types/command";
import dedent from "dedent-js";

export default {
    data: new SlashCommandBuilder()
        .setName("powitanie")
        .setDescription(
            "Kanał na którym będą pojawiać się wiadomości witające nowe osoby"
        )
        .addSubcommand((command) =>
            command
                .setName("ustaw")
                .setDescription("Ustaw kanał powitań na serwezre")
                .addChannelOption((option) =>
                    option
                        .setName("kanał")
                        .setDescription("Wybierz kanał na którym będą wiadomości witające")
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
        .addSubcommand((command) =>
            command
                .setName("konfiguruj")
                .setDescription("Konfiguruj powitania")
                .addChannelOption((option) =>
                    option
                        .setName("kanał")
                        .setDescription("Zmień kanał który będą powitania")
                        .addChannelTypes(ChannelType.GuildText)
                )
                .addAttachmentOption((option) =>
                    option.setName("tło").setDescription("Zmień tło obrazka w powitaniu")
                )
        )
        .addSubcommand((command) =>
            command
                .setName("usuń")
                .setDescription("Usuń wybrane przez ciebie rzeczy dotyczące powitań")
                .addStringOption((option) =>
                    option
                        .setName("rzecz")
                        .setDescription("Wybierz rzecz do usunięcia")
                        .setChoices({
                            name: `tło (zmień do domyślnych)`,
                            value: `background`,
                        })
                        .setRequired(true)
                )
        ),

    async execute(interaction, client) {
        switch (interaction.options.getSubcommand()) {
            case "ustaw":
                {
                    const channel = interaction.options.getChannel("kanał");
                    const prismaWelcome = await client.prisma.welcomeChannel.findFirst({
                        where: {
                            id: interaction.guild.id,
                        },
                    });
                    if (!prismaWelcome) {
                        await client.prisma.welcomeChannel.create({
                            data: {
                                id: interaction.guild.id,
                                channel: channel.id,
                            },
                        });
                        console.log(1);
                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(client.color)
                                    .setImage(client.divider)
                                    .setDescription(
                                        dedent`
                                  kanał powitania został ustawiony na <#${channel}>
                                  od teraz nowi użytkownicy będą witani na tym kanale
                              `
                                    )
                                    .setAuthor({
                                        name: interaction.user.username,
                                        iconURL: interaction.user.displayAvatarURL(),
                                    }),
                            ],
                        });
                    } else {
                        await client.prisma.welcomeChannel.update({
                            where: {
                                id: interaction.guild.id,
                            },
                            data: {
                                channel: channel.id,
                            },
                        });
                        console.log(2);
                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(client.color)
                                    .setImage(client.divider)
                                    .setDescription(
                                        dedent`
                                  kanał powitania został ustawiony na <#${channel}>
                                  od teraz nowi użytkownicy będą witani na tym kanale
                              `
                                    )
                                    .setAuthor({
                                        name: interaction.user.username,
                                        iconURL: interaction.user.displayAvatarURL(),
                                    }),
                            ],
                        });
                    }
                }
                break;
            case "konfiguruj":
                {
                    const channel = interaction.options.getChannel("kanał");
                    const background = interaction.options.getAttachment("tło");
                    const prismaWelcome = await client.prisma.welcomeChannel.findFirst({
                        where: {
                            id: interaction.guild.id,
                        },
                    });
                    if (channel) {
                        if (!prismaWelcome && !prismaWelcome.channel)
                            return interaction.reply({
                                ephemeral: true,
                                embeds: [
                                    new EmbedBuilder()
                                        .setImage(client.divider)
                                        .setColor(client.color)
                                        .setTitle("Błąd")
                                        .setDescription(
                                            "Najpierw ustaw kanał przez **/powitanie ustaw <kanał>**"
                                        )
                                        .setAuthor({
                                            name: interaction.user.username,
                                            iconURL: interaction.user.displayAvatarURL(),
                                        }),
                                ],
                            });
                        else {
                            await client.prisma.welcomeChannel.update({
                                where: {
                                    id: interaction.guild.id,
                                },
                                data: {
                                    channel: channel.id,
                                },
                            });
                            interaction.reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor(client.color)
                                        .setImage(client.divider)
                                        .setAuthor({
                                            name: interaction.user.username,
                                            iconURL: interaction.user.displayAvatarURL(),
                                        })
                                        .setDescription(
                                            `Zmieniono kanał powitań na <#${channel.id}>`
                                        ),
                                ],
                            });
                        }
                    }
                    console.log(background);
                    if (background) {
                        const developerChannel = client.guilds.cache
                            .get("1204790378709000193")
                            .channels.cache.get("1204794757877071883") as TextChannel;

                        if (!developerChannel)
                            return console.error(
                                "!!! Brak kanału na podania na background do canvasow!!!"
                            );
                        console.log(background.contentType);
                        if (
                            !background.contentType.startsWith("image/") ||
                            (!background.contentType.includes("jpeg") &&
                                !background.contentType.includes("png"))
                        ) {
                            return interaction.reply({
                                content:
                                    "Niepoprawny format pliku. Dozwolone formaty plików: **PNG, JPG**",
                                ephemeral: true,
                            });
                        }
                        const existingBackground =
                            await client.prisma.welcomeChannel.findFirst({
                                where: {
                                    id: interaction.guild.id,
                                },
                            });

                        if (!existingBackground && !existingBackground.channel)
                            return interaction.reply({
                                ephemeral: true,
                                embeds: [
                                    new EmbedBuilder()
                                        .setImage(client.divider)
                                        .setColor(client.color)
                                        .setTitle("Błąd")
                                        .setDescription(
                                            "Najpierw ustaw kanał przez **/powitanie ustaw <kanał>**"
                                        )
                                        .setAuthor({
                                            name: interaction.user.username,
                                            iconURL: interaction.user.displayAvatarURL(),
                                        }),
                                ],
                            });

                        const row: any = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId("accept_background")
                                .setStyle(ButtonStyle.Success)
                                .setEmoji("✅"),
                            new ButtonBuilder()
                                .setCustomId("deny_background")
                                .setStyle(ButtonStyle.Danger)
                                .setEmoji("✖")
                        );

                        await developerChannel.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(client.color)
                                    .setImage(background.url)
                                    .setDescription(
                                        dedent`
                              Nowy background (link): ${background.url}
                              Typ pliku: ${background.contentType}
                              Osoba: ${interaction.user.id} (${interaction.user.username})
                              Serwer: ${interaction.guild.id} (${interaction.guild.name})
                              `
                                    )
                                    .setTitle(`${interaction.guild.id}`),
                            ],
                            components: [row],
                        });
                        interaction.reply({
                            embeds: [new EmbedBuilder()
                                .setImage(client.divider)
                                .setColor(client.color)
                                .setDescription("Twoja prośba o nowy background została wysłana do sprawdzenia!")
                                .setImage(background.url)
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL(),
                                }),

                            ]
                        })
                    }
                }
                break;
            case "usuń": {
                const checkPrisma =
                    await interaction.client.prisma.welcomeChannel.findFirst({
                        where: {
                            id: interaction.guild.id,
                        },
                    });
                console.log(1)
                if (!checkPrisma.background)
                    return interaction.reply({
                        ephemeral: true,
                        embeds: [
                            new EmbedBuilder()
                                .setImage(client.divider)
                                .setColor(client.color)
                                .setTitle("Błąd")
                                .setDescription("Nie posiadasz żadnych danych do usunięcia")
                                .setAuthor({
                                    name: interaction.user.username,
                                    iconURL: interaction.user.displayAvatarURL(),
                                }),
                        ],
                    });
                console.log(2)
                await interaction.client.prisma.welcomeChannel.update({
                    where: { id: interaction.guild.id },
                    data: { background: null },
                });
                console.log(3)
            }
        }
    },
} as CommandType;
