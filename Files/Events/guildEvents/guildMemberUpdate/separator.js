const { Worker } = require('worker_threads');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
	async execute(oldMember, newMember) {
		const takeThese = new Array, giveThese = new Array;
		const client = oldMember ? oldMember.client : newMember.client;
		const ch = client.ch;
		const guild = oldMember ? oldMember.guild : newMember.guild;
		if (guild.id == '715121965563772980') return;
		const member = newMember ? newMember : await guild.members.fetch(newMember.id);
		const res = await ch.query('SELECT * FROM roleseparator WHERE active = true AND guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			res.rows.forEach(async (row) => {
				const guild = client.guilds.cache.get(row.guildid);
				if (guild) {
					const separator = guild.roles.cache.get(row.separator);
					if (separator) {
						let aknowledgedSeperator = false;
						if (row.isvarying) {
							const roles = [];
							if (row.stoprole) {
								const stopRole = guild.roles.cache.get(row.stoprole);
								if (stopRole) {
									guild.roles.cache.forEach(r => {
										if ((stopRole.rawPosition > separator.rawPosition) && (r.rawPosition < stopRole.rawPosition && r.rawPosition > separator.rawPosition)) roles.push(r.id);
										else if ((stopRole.rawPosition < separator.rawPosition) && (r.rawPosition > stopRole.rawPosition && r.rawPosition < separator.rawPosition)) roles.push(r.id);
									});
								} else ch.query('UPDATE roleseparator SET active = false WHERE stoprole = $1;', [row.stoprole]);
							} else guild.roles.cache.forEach(r => {if (r.rawPosition > separator.rawPosition) roles.push(r.id);});
							if (roles[0]) {
								for (let i = 0; i < roles.length; i++) {
									const role = guild.roles.cache.get(roles[i]);
									if (member.roles.cache.has(role.id)) {
										aknowledgedSeperator = true;
										if (!member.roles.cache.has(separator.id)) giveThese.push(separator.id);
									}
								}
							}
						} else {
							row.roles.forEach(async id => {
								if (member.roles.cache.has(id)) {
									aknowledgedSeperator = true;
									if (!member.roles.cache.has(separator.id)) giveThese.push(separator.id);
								}
							});
						}
						if (aknowledgedSeperator == false && member.roles.cache.has(separator.id)) takeThese.push(separator.id);
					} else ch.query('UPDATE roleseparator SET active = false WHERE separator = $1;', [row.separator]);
				}
			});
		}
		if (takeThese.length > 0) newMember.roles.remove(takeThese).catch(() => {});
		if (giveThese.length > 0) newMember.roles.add(giveThese).catch(() => {});
	},
	async oneTimeRunner(msg, embed, clickButton) {
		const client = msg.client;
		const ch = client.ch;
		const res = await ch.query('SELECT * FROM roleseparator WHERE active = true AND guildid = $1;', [msg.guild.id]);
		let membersWithRoles;
		if (+res.rows[0].lastrun + 604800000 > Date.now()) membersWithRoles = false;
		else {
			msg.client.ch.query('UPDATE roleseparator SET lastrun = $1 WHERE guildid = $2;', [Date.now(), msg.guild.id]);
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
			return;
		}
		if (!Array.isArray(membersWithRoles)) {
			embed
				.setAuthor(
					msg.client.ch.stp(msg.lanSettings.author, {type: msg.lan.type}), 
					msg.client.constants.emotes.settingsLink, 
					msg.client.constants.standard.invite
				)
				.setDescription(msg.lan.edit.oneTimeRunner.time);
			msg.m.edit({embeds: [embed], components: []}).catch(() => {});
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
				.setDescription(msg.client.ch.stp(msg.lan.edit.oneTimeRunner.stats, {members: membersWithRoles && membersWithRoles.length > 0 ? membersWithRoles.length : '0', roles: membersWithRoles && membersWithRoles.length > 0 ? (membersWithRoles.length * 2) : '0', time: moment.duration((membersWithRoles ? membersWithRoles.length*2 : 0) * 1000).format(`d [${msg.language.time.days}], h [${msg.language.time.hours}], m [${msg.language.time.minutes}], s [${msg.language.time.seconds}]`), finishTime: `<t:${Math.floor(Date.now()/1000) + (membersWithRoles ? membersWithRoles.length*2 : 0)}:F> (<t:${Math.floor(Date.now()/1000) + (membersWithRoles ? membersWithRoles.length*2 : 0)}:R>)`}));
			msg.m.edit({embeds: [embed], components: []}).catch(() => {});
		}
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
			membersWithRoles.forEach((raw, index) => {
				setTimeout(() => {
					const giveRoles = raw.giveTheseRoles;
					const takeRoles = raw.removeTheseRoles;
					const member = msg.guild.members.cache.get(raw.id);
					if (giveRoles) member.roles.add(giveRoles).catch(() => {});
					if (takeRoles) member.roles.remove(takeRoles).catch(() => {});
				}, index * 3000);
			});
		}
	}
};

