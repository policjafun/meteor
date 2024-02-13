import { SelectType } from '../../types/select';

export default {
    id: 'selfrole-panel',
    execute: async (interaction) => {
        const values = interaction.values;

        const roles = interaction.guild.roles.cache.filter(role => values.includes(role.id)).map(role => role.id);
        const member = interaction.guild.members.fetch(interaction.user.id);

        if(!member) return;
        (await member).roles.add(roles);


        interaction.reply({
            content: 'Pomyślnie dodano role',
            ephemeral: true
        });
    }
} as SelectType;