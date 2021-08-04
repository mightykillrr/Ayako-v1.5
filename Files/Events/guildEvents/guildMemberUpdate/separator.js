const { Worker } = require('worker_threads');

module.exports = {
	async execute(oldMember, newMember) {
		const client = oldMember ? oldMember.client : newMember.client;
		const ch = client.ch;
		const guild = oldMember ? oldMember.guild : newMember.guild;
		const member = newMember ? newMember : ch.member(guild, oldMember.user);
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
										if (!member.roles.cache.has(separator.id)) await member.roles.add(separator).catch(() => {});
									}
								}
							}
						} else {
							row.roles.forEach(async id => {
								if (member.roles.cache.has(id)) {
									aknowledgedSeperator = true;
									if (!member.roles.cache.has(separator.id)) await member.roles.add(separator).catch(() => {});
								}
							});
						}
						if (aknowledgedSeperator == false && member.roles.cache.has(separator.id)) await member.roles.remove(separator).catch(() => {});
					} else ch.query('UPDATE roleseparator SET active = false WHERE separator = $1;', [row.separator]);
				}
			});
		}
	},
	async oneTimeRunner(msg) {
		const client = msg.client;
		const ch = client.ch;
		const res = await ch.query('SELECT * FROM roleseparator WHERE active = true AND guildid = $1;', [msg.guild.id]);
		//if (+r.lastrun + 604800000 > Date.now()) return false;
		msg.client.ch.query('UPDATE roleseparator SET lastrun = $1 WHERE guildid = $2;', [Date.now(), msg.guild.id]);
		let membersWithRoles = await this.getNewMembers(msg.guild, res);
		membersWithRoles = [...new Set(membersWithRoles)];
		if (membersWithRoles.length > 0) {
			for (let i = 0; i < membersWithRoles.length; i++) {
				const giveRoles = membersWithRoles[i].giveTheseRoles;
				const takeRoles = membersWithRoles[i].removeTheseRoles;
				const member = msg.guild.members.cache.get(membersWithRoles[i].user.id);
				const timeOut = +i * 1000 * +(giveRoles ? +giveRoles.length : 0 + takeRoles ? +takeRoles.length : 0);
				setTimeout(() => {
					if (giveRoles) {
						for (let j = 0; j < giveRoles.length; j++) {
							const r = giveRoles[j];
							setTimeout(() => {
								if (!member.roles.cache.has(r)) member.roles.add(r);
							}, j*giveRoles.length);
						}
					}
					if (takeRoles) {
						for (let j = 0; j < takeRoles.length; j++) {
							const r = takeRoles[j];
							setTimeout(() => {
								if (member.roles.cache.has(r)) member.roles.remove(r);
							}, j*takeRoles.length);
						}
					}
				}, timeOut);
			}
		}
		let allRoles = 0;
		membersWithRoles.forEach(m => {
			if (m.giveTheseRoles && m.removeTheseRoles) allRoles = allRoles + m.giveTheseRoles.length + m.removeTheseRoles.length;
			else if (m.removeTheseRoles) allRoles = allRoles + m.removeTheseRoles; 
			else if (m.giveTheseRoles) allRoles = allRoles + m.giveTheseRoles;
		});
		return [allRoles, membersWithRoles.length];
	},
	async getNewMembers(guild, res) {
		const obj = new Object;
		obj.members = new Array, obj.separators = new Array, obj.rowroles = new Array, obj.roles = new Array, obj.highestRole = new Object({id: guild.roles.highest.id, rawPosition: guild.roles.highest.rawPosition});
		await guild.members.fetch();
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
		console.log(output);
		return output;
	}
};

