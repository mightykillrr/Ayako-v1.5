const { Worker } = require('worker_threads');
const moment = require('moment');
require('moment-duration-format');
const Discord = require('discord.js');
const timeOuts = new Discord.Collection();

module.exports = {
	async execute(oldMember, newMember) {
		const client = newMember ? newMember.client : oldMember.client;
		const ch = client.ch;
		const guild = newMember ? newMember.guild : oldMember.guild;
		//if (guild.id == '715121965563772980') return;
		const member = newMember ? newMember : await guild.members.fetch(newMember.id);
		const res = await ch.query('SELECT * FROM roleseparator WHERE active = true AND guildid = $1;', [guild.id]);
		const giveThese = new Array, takeThese = new Array;
		if (res && res.rowCount > 0) {
			res.rows.forEach(async (row) => {
				const guild = client.guilds.cache.get(row.guildid);
				if (guild) {
					const sep = guild.roles.cache.get(row.separator);
					if (sep) {
						if (row.isvarying) {
							const stop = row.stoprole ? guild.roles.cache.get(row.stoprole) : null;
							const affectedRoles = new Array;
							const roles = guild.roles.cache.sort((a, b) => a.rawPosition - b.rawPosition).map(o => o);
							if (row.stoprole) {
								if (sep.rawPosition > stop.rawPosition) for (let i = stop.rawPosition+1; i < roles.length && i < sep.rawPosition; i++) affectedRoles.push(roles[i]);
								else for (let i = sep.rawPosition+1; i < roles.length && i < stop.rawPosition; i++) affectedRoles.push(roles[i]);
							} else {
								if (sep.rawPosition >= guild.roles.highest.rawPosition) null;
								else for (let i = sep.rawPosition+1; i < roles.length && i < guild.roles.highest.rawPosition; i++) affectedRoles.push(roles[i]);
							}
							const has = new Array;
							affectedRoles.map(o => o).forEach(role => {
								if (member.roles.cache.has(role.id)) has.push(true);
								else has.push(false); 
							});
							if (has.includes(true)) giveThese.push(sep.id);
							else takeThese.push(sep.id);
						} else {
							const has = new Array;
							row.roles.forEach(role => {
								if (member.roles.cache.cache.has(role)) has.push(true);
								else has.push(false);
							});
							if (has.includes(true)) giveThese.push(sep.id);
							else takeThese.push(sep.id);
						}
					} else ch.query('UPDATE roleseparator SET active = false WHERE separator = $1;', [row.separator]);
				}
			});
		}
		giveThese.forEach((roleID, index) => {if (member.roles.cache.has(roleID)) giveThese.splice(index, 1);});
		if (giveThese.length > 0) await member.roles.add(giveThese).catch(() => {});
		takeThese.forEach((roleID, index) => {if (!member.roles.cache.has(roleID)) takeThese.splice(index, 1);});
		if (takeThese.length > 0) await member.roles.remove(takeThese).catch(() => {});
	},
	async oneTimeRunner(msg, embed, clickButton) {
		const client = msg.client;
		const ch = client.ch;
		const res = await ch.query('SELECT * FROM roleseparator WHERE active = true AND guildid = $1;', [msg.guild.id]);
		let membersWithRoles;
		if (+res.rows[0].lastrun + 604800000 > Date.now() && msg.author.id !== client.user.id) membersWithRoles = false;
		else if (res.rows[0].stillrunning && msg.author.id !== client.user.id) membersWithRoles = true;
		else {
			msg.client.ch.query('UPDATE roleseparator SET lastrun = $1, stillrunning = $3 WHERE guildid = $2;', [Date.now(), msg.guild.id, true]);
			membersWithRoles = await this.getNewMembers(msg.guild, res);
			await msg.guild.members.fetch();
		}
		await clickButton.deleteReply().catch(() => {});
		if (membersWithRoles == 'timeout') {
			embed
				.setAuthor(
					msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
					msg.client.constants.emotes.settingsLink, 
					msg.client.constants.standard.invite
				)
				.setDescription(msg.lan.edit.oneTimeRunner.timeout);
			msg.m.edit({embeds: [embed], components: []}).catch(() => {});
			msg.client.ch.query('UPDATE roleseparator SET lastrun = $1, stillrunning = $3 WHERE guildid = $2;', [null, msg.guild.id, false]);
			return;
		}
		if (!Array.isArray(membersWithRoles)) {
			if (!membersWithRoles) {
				embed
					.setAuthor(
						msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
						msg.client.constants.emotes.settingsLink, 
						msg.client.constants.standard.invite
					)
					.setDescription(msg.lan.edit.oneTimeRunner.time);
				msg.m.edit({embeds: [embed], components: []}).catch(() => {});
			} else {
				embed
					.setAuthor(
						msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
						msg.client.constants.emotes.settingsLink, 
						msg.client.constants.standard.invite
					)
					.setDescription(msg.lan.edit.oneTimeRunner.stillrunning);
				msg.m.edit({embeds: [embed], components: []}).catch(() => {});
			}
		} else {
			membersWithRoles.forEach((m, index) => {
				const fakeMember = m;
				const realMember = msg.guild.members.cache.get(m.id);
				if (realMember) {
					if (fakeMember.giveTheseRoles) fakeMember.giveTheseRoles.forEach((roleID, rindex) => {
						if (realMember.roles.cache.has(roleID)) membersWithRoles[index].giveTheseRoles.splice(rindex, 1); 
					});
					if (fakeMember.removeTheseRoles) fakeMember.removeTheseRoles.forEach((roleID, rindex) => {
						if (!realMember.roles.cache.has(roleID)) membersWithRoles[index].removeTheseRoles.splice(rindex, 1);
					});
				}
			});
			embed
				.setAuthor(
					msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
					msg.client.constants.emotes.settingsLink, 
					msg.client.constants.standard.invite
				)								
				.setDescription(msg.client.ch.stp(msg.lan.edit.oneTimeRunner.stats, {members: membersWithRoles && membersWithRoles.length > 0 ? membersWithRoles.length : '0', roles: membersWithRoles && membersWithRoles.length > 0 ? (membersWithRoles.length * 3) : '0', time: moment.duration((membersWithRoles ? membersWithRoles.length*2 : 0) * 1000).format(`d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`), finishTime: `<t:${Math.floor(Date.now()/1000) + (membersWithRoles ? membersWithRoles.length*3 : 0)}:F> (<t:${Math.floor(Date.now()/1000) + (membersWithRoles ? membersWithRoles.length*3 : 0)}:R>)`}));
			msg.m.edit({embeds: [embed], components: []}).catch(() => {});
		}
		msg.client.ch.query('UPDATE roleseparator SET finishat = $1 WHERE guildid = $2;', [Math.floor(Date.now()/1000) + (membersWithRoles ? membersWithRoles.length*3 : 0), msg.guild.id]);
		this.assinger(msg, membersWithRoles);
	},
	async getNewMembers(guild, res) {
		await guild.members.fetch();
		const obj = new Object;
		obj.members = new Array, obj.separators = new Array, obj.rowroles = new Array, obj.roles = new Array, obj.highestRole = new Object({id: guild.roles.highest.id, rawPosition: guild.roles.highest.rawPosition});
		guild.members.cache.forEach(member => {
			const roles = new Array; 
			member.roles.cache.forEach(role => {
				roles.push({id: role.id, rawPosition: role.rawPosition});
			});
			obj.members.push({id: member.user.id, roles: roles});
		});
		guild.roles.cache.forEach(role => {
			obj.roles.push({id: role.id, rawPosition: role.rawPosition});
		});
		res.rows.forEach(r => {
			if (r.stoprole) obj.separators.push({separator: {id: r.separator, rawPosition: guild.roles.cache.get(r.separator)?.rawPosition}, stoprole: {id: r.stoprole, rawPosition: guild.roles.cache.get(r.stoprole)?.rawPosition}});
			else obj.separators.push({separator: {id: r.separator, rawPosition: guild.roles.cache.get(r.separator)?.rawPosition}});
			if (r.roles && r.roles.length > 0) obj.roles.forEach(roleid => {
				const role = guild.roles.cache.get(roleid);
				obj.rowroles.push({id: role.id, rawPosition: role.rawPosition});
			});
		});
		const worker = new Worker('./Files/Events/guildEvents/guildMemberUpdate/separatorWorker.js', {workerData: {res: res.rows, obj: obj}});
		let output;
		await new Promise((resolve, reject) => {
			worker.once('message', result => {
				output = result;
				resolve();
				worker.terminate();
			});
			worker.once('error', error => {
				reject();
				throw error;
			});
		});
		return output;
	},
	async assinger(msg, membersWithRoles) {
		if (membersWithRoles.length > 0) {
			membersWithRoles = membersWithRoles.sort((a,b) => {a.id - b.id;});
			membersWithRoles.forEach( (raw, index) => {
				setTimeout(async () => {
					const giveRoles = raw.giveTheseRoles;
					const takeRoles = raw.removeTheseRoles;
					const member = msg.guild.members.cache.get(raw.id);
					if (giveRoles) await member.roles.add(giveRoles).catch(() => {});
					if (takeRoles) await member.roles.remove(takeRoles).catch(() => {});
					if (index == (membersWithRoles.lengt-1)) msg.client.ch.query('UPDATE roleseparator SET stillrunning = $1 WHERE guildid = $2;', [false, msg.guild.id]);
				}, index * 3000);
			});
		}
	}
};

