const Discord = require('discord.js');

module.exports = {
	async notValid(msg) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(
				`${msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type})}`, 
				msg.client.constants.emotes.settingsLink, 
				msg.client.constants.standard.invite
			)
			.setDescription(`${msg.lanSettings.notValid}`)
			.setFooter(`${msg.lanSettings.pleaseRestart}`);
		if (msg.lan.answers) embed.addField(msg.language.commands.settings.valid, msg.lan.answers);
		msg.client.ch.reply(msg.m, embed);
	}, 
	noEmbed(msg) {
		const embed = new Discord.MessageEmbed()
			.setAuthor(msg.client.ch.stp(msg.language.commands.settings.noEmbed.author, {type: ''}))
			.setDescription(msg.language.commands.settings.noEmbed.desc)
			.setColor(msg.client.constants.commands.settings.color);
		return embed;
	},
	async log(oldRow, msg) {
		let newRow;
		const newRes = await msg.client.ch.query(`SELECT * FROM ${msg.client.constants.commands.settings.tablenames[msg.file.name]} WHERE guildid = $1;`, [msg.guild.id]);
		if (newRes && newRes.rowCount > 0) newRow = newRes.rows[0];
		if (!newRow || !oldRow) return;
		if (newRow == oldRow) return;
		const changed = [];
		for (let i = 0; i < Object.entries(newRow).length; i++) {
			if (Object.entries(oldRow)[i][1] !== Object.entries(newRow)[i][1]) changed.push([[Object.entries(oldRow)[i][0], Object.entries(oldRow)[i][1]], [Object.entries(newRow)[i][0], Object.entries(newRow)[i][1]]]);
		}
		const embed = new Discord.MessageEmbed()
			.setColor(msg.client.constants.commands.settings.log.color)
			.setTimestamp()
			.setAuthor(msg.client.ch.stp(msg.language.selfLog.author, {setting: msg.lan.type}))
			.setDescription(msg.client.ch.stp(msg.language.selfLog.description, {msg: msg, setting: msg.file.name}));
		if (changed.length > 0) {
			changed.forEach(change => {
				if ((Array.isArray(change[0][1]) && Array.isArray(change[1][1])) && change[0][1].equals(change[1][1])) return;
				embed.addFields(
					{
						name: `${msg.lan[change[1][0] == 'active' ? 'type' : change[1][0]].includes('{{amount}}') ? msg.client.ch.stp(msg.lan[change[1][0] == 'active' ? 'type' : change[1][0]], {amount: '--'}) : msg.lan[change[1][0] == 'active' ? 'type' : change[1][0]]}`, 
						value: 
							`__${msg.lanSettings.oldValue}__: ${Array.isArray(change[0][1]) ? change[0][1].map(c => change[0][0].includes('role') ? ` <@&${c}>` : change[0][0].includes('channel') ? ` <#${c}>` : change[0][0].includes('user') ? ` <@${c}>` : ` ${c}`) : change[0][1] == null ? msg.language.none : change[0][1]}\n`+
							`__${msg.lanSettings.newValue}__: ${Array.isArray(change[1][1]) ? change[1][1].map(c => change[1][0].includes('role') ? ` <@&${c}>` : change[1][0].includes('channel') ? ` <#${c}>` : change[1][0].includes('user') ? ` <@${c}>` : ` ${c}`) : change[1][1] == null ? msg.language.none : change[1][1]}`,
						inline: false
					}
				);
			});
			const res = await msg.client.ch.query('SELECT * FROM logchannels WHERE guildid = $1;', [msg.guild.id]);
			if (res && res.rowCount > 0 && res.rows[0].verbositylog) {
				const channel = msg.client.channels.cache.get(res.rows[0].verbositylog);
				if (channel) msg.client.ch.send(channel, {embeds: [embed]});
			}
		}
	},
	async aborted(msg, collectors) {
		msg.client.constants.commands.settings.editRequire.splice(2, 1);
		collectors.forEach(collector => collector.stop());
		msg.m.delete().catch(() => {});
		msg.reply({content: msg.language.aborted});
	},
};