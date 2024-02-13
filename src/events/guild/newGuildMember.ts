import { EventType } from '../../types/event';
import { GuildMember } from 'discord.js';

export default {
    name: 'GuildMemberAdd',
    async execute(member: GuildMember) {
        const data = await member.client.prisma.joinRole.findMany({
            where: {
                guildId: member.guild.id
            }
        });
        
        if(data) {
            const roles = data.map(r => r.roleId);

            for (const role of roles) {
                const roleExists = member.guild.roles.cache.get(role);
                if (!roleExists) {
                    await member.client.prisma.joinRole.delete({
                        where: {
                            roleId: role
                        }
                    });
                }
            }

            await member.roles.add(roles);
        }
    }
} as EventType;