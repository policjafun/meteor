import { EmbedBuilder } from 'discord.js';
import { ModalType } from '../../types/modal';

// model SelfRolePanel {
//     guildId String
//     panelDisplayName String
//     panelId String @id
  
//     createdAt DateTime @default(now())
//     updatedAt DateTime @updatedAt
  
//     roles SelfRole[] 
//   }
  
//   model SelfRole {
//     panelId String @id
  
//     roleId String
//     name   String
//     emoji  String?
//     description String?
  
//     createdAt DateTime @default(now())
//     updatedAt DateTime @updatedAt
  
//     panel SelfRolePanel @relation(fields: [panelId], references: [panelId])
//   }
  

export default {
    id: 'selfrole-stworz-dodaj',
    execute: async (interaction) => {
        const panelName = interaction.customId.split(':')[1];

        const nazwa = interaction.fields.getTextInputValue('roleName');
        const opis = interaction.fields.getTextInputValue('roleDescription');
        const emoji = interaction.fields.getTextInputValue('roleEmoji');

        const role = interaction.guild.roles.cache.find(r => r.name === nazwa || r.id === nazwa);

        if(!role) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription('Nie znaleziono roli')
                    .setColor(interaction.client.color)
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL()
                    })
            ],
            ephemeral: true
        });

        if(role.managed || !role.editable ) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription('Nie można dodać roli, która nie jest zarządzana przez bota lub jest zarządzana przez inną aplikację')
                ],
                ephemeral: true
            });
            
        }
        
        const data = await interaction.client.prisma.selfRole.findFirst({
            where: {
                roleId: role.id
            }
        });

        if(data) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription('Rola jest już dodana do panelu')
                    .setColor(interaction.client.color)
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                ]
        });

        console.log(panelName);

        await interaction.client.prisma.selfRole.create({
            data: {
                panelId: panelName,
                roleId: role.id,
                emoji: emoji,
                description: opis,
            }
        });

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription('gites')
                    .setColor(interaction.client.color)
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL()
                    })
            ]
        });




    }
} as ModalType;