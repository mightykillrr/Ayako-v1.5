const Discord = require('discord.js');

module.exports = {
	perm: 268435456n,
	type: 2,
	async mmrEmbed(msg, res) {
		const result = await checker(msg, res);
		if (result) res = await msg.client.ch.query('SELECT * FROM roleseparator WHERE guildid = $1;', [msg.guild.id]);
		const embed = new Discord.MessageEmbed();
		for (let i = 0; i < res.length; i++) {
			const r = res[i];
			const sep = msg.guild.roles.cache.get(r.separator);
			const stop = r.stoprole ? msg.guild.roles.cache.get(r.stoprole) : null;
			const affected = r.stoprole ? (sep.rawPosition > stop.rawPosition ? sep.rawPosition - stop.rawPosition : stop.rawPosition - sep.rawPosition)-1 : (sep.rawPosition > msg.guild.roles.highest.rawPosition ? sep.rawPosition - msg.guild.roles.highest.rawPosition : msg.guild.roles.highest.rawPosition - sep.rawPosition)-1;
			embed.addFields(
				{
					name: `${msg.language.number}: \`${r.id}\` | ${r.active ? `${msg.client.constants.emotes.tick} ${msg.language.enabled}` : `${msg.client.constants.emotes.cross} ${msg.language.disabled}`}`,
					value: `${msg.lan.separator}: ${sep} | ${msg.lan.stoprole}: ${r.stoprole ? stop : msg.language.none}\n${msg.language.affectedRoles}: ${affected} ${msg.language.roles}`, 
					inline: true
				}
			);
		}
		embed.setDescription(msg.lan.edit.oneTimeRunner.name.replace('[{{trigger}}] ', ''));
		return embed;
	},
	displayEmbed(msg, r) {
		const embed = new Discord.MessageEmbed();
		if (r.isvarying == true) {
			embed.addFields(
				{
					name: msg.lanSettings.active, 
					value: r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, 
					inline: false
				},
				{
					name: '\u200b', 
					value: '\u200b', 
					inline: false
				},
				{
					name: msg.language.isvarying, 
					value:  r.isvarying ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled,
					inline: false
				},
				{
					name: '\u200b', 
					value: '\u200b', 
					inline: false
				},
				{
					name: msg.lan.separator, 
					value: r.separator ? `\`${msg.guild.roles.cache.get(r.separator)}\`` : msg.language.none, 
					inline: false
				},
				{
					name: msg.lan.stoprole, 
					value: r.stoprole ? `\`${msg.guild.roles.cache.get(r.stoprole)}\`` : msg.language.none, 
					inline: false
				},
				{
					name: msg.language.number, 
					value: r.id ? `\`${r.id}\`` : msg.language.none, 
					inline: false
				}
			);
		} else {
			embed.addFields(
				{
					name: msg.lanSettings.active, 
					value: r.active ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled, 
					inline: false
				},
				{
					name: '\u200b', 
					value: '\u200b', 
					inline: false
				},
				{
					name: msg.language.isvarying, 
					value:  r.isvarying ? msg.client.constants.emotes.tick+' '+msg.language.enabled : msg.client.constants.emotes.cross+' '+msg.language.disabled,
					inline: false
				},
				{
					name: '\u200b', 
					value: '\u200b', 
					inline: false
				},
				{
					name: msg.lan.separator, 
					value: r.separator ? `\`${msg.guild.roles.cache.get(r.separator)}\`` : msg.language.none, 
					inline: false
				},
				{
					name: msg.lan.roles, 
					value: `${r.roles && r.roles.length > 0 ? r.roles.map(id => ` <@&${id}>`) : msg.language.none}`, 
					inline: false
				},
				{
					name: msg.language.number, 
					value: r.id ? `\`${r.id}\`` : msg.language.none, 
					inline: false
				},
			);
		}
		return embed;
	},

};

async function checker(msg, res) {
	const sepend = [];
	const stopend = [];
	res.rows.forEach(row => {
		const sep = msg.guild.roles.cache.get(row.separator);
		const stop = msg.guild.roles.cache.get(row.stoprole);
		if (!sep || !sep.id) sepend.push(row.separator);
		if (!stop || !stop.id) stopend.push(row.stoprole);	
	});
	for (const s of sepend) {await msg.client.ch.query('DELETE FROM roleseparator WHERE guildid = $1 AND separator = $2;', [msg.guild.id, s]);}
	for (const s of stopend) {await msg.client.ch.query('DELETE FROM roleseparator WHERE guildid = $1 AND stoprole = $2;', [msg.guild.id, s]);}
	if (sepend.length > 0 || stopend.length > 0) return true;
	else return false;
}