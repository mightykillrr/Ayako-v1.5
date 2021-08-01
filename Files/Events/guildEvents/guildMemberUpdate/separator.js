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
		const members = [...msg.guild.members.cache.entries()];
		const client = msg.client;
		const ch = client.ch;
		const res = await ch.query('SELECT * FROM roleseparator WHERE active = true AND guildid = $1;', [msg.guild.id]);
		const r = res.rows[0];
		//if (+r.lastrun + 604800000 > Date.now()) return false;
		msg.client.ch.query('UPDATE roleseparator SET lastrun = $1 WHERE guildid = $2;', [Date.now(), msg.guild.id]);
		await msg.guild.members.fetch();
		const membersWithRoles = [];
		for (let i = 0; members.length > i; i++) {
			const memberr = members[i];
			const member = memberr[1];
			if (res && res.rowCount > 0) {
				const giveRoleArr = [];
				res.rows.forEach(async (row) => {
					const guild = client.guilds.cache.get(row.guildid);
					if (guild) {
						const separator = guild.roles.cache.get(row.separator);
						if (separator) {
							if (r.isvarying) {
								const stopRole = guild.roles.cache.get(row.stoprole);
								member.roles.cache.forEach((role) => {
									if (stopRole) {
										if (stopRole.rawPosition > separator.rawPosition) {
											if (role.rawPosition > separator.rawPosition && role.rawPosition < stopRole.rawPosition) giveRoleArr.push(separator);

										} else if (stopRole.rawPosition < separator.rawPosition) {
											if (role.rawPosition < separator.rawPosition && role.rawPosition > stopRole.rawPosition) giveRoleArr.push(separator);
										}
									} else if (role.rawPosition > separator.rawPosition) giveRoleArr.push(separator);
								});
							} else {
								r.roles.forEach(id => {
									if (member.roles.cache.has(id)) giveRoleArr.push(separator);
								});
							}
						} else ch.query('UPDATE roleseparator SET active = false WHERE separator = $1;', [row.separator]);
					}
				});
				const giveUniques = [...new Set(giveRoleArr)];
				if (giveRoleArr.length > 0) {
					member.giveTheseRoles = giveUniques;
					membersWithRoles.push(member);
				}
			} else return;
		}
		const uniqueMembers = new Array;
		membersWithRoles.forEach(member => {
			const rs = member.giveTheseRoles.map(r => r);
			const tempRoles = new Array;
			rs.forEach(r => {
				if (!tempRoles.includes(r)) tempRoles.push(r);
			});
			member.giveTheseRoles = tempRoles.map(r => r);
			uniqueMembers.push(member);
		});
		for (let i = 0; i < membersWithRoles.length; i++) {
			const roles = membersWithRoles[i].giveTheseRoles;
			membersWithRoles[i].removeTheseRoles = new Array;
			res.rows.forEach(row => {
				if (!roles.includes(row.separator)) membersWithRoles[i].removeTheseRoles.push(row.separator);
			});
		}
		let TotalLength;
		if (uniqueMembers.length > 0) {
			for (let i = 0; i < uniqueMembers.length; i++) {
				const member = uniqueMembers[i];
				const timeOut = i*1000*(member.giveTheseRoles.length+member.removeTheseRoles.length);
				TotalLength = TotalLength + timeOut;
				setTimeout(() => {
					for (let j = 0; j < member.giveTheseRoles.length; j++) {
						setTimeout(() => {
							if (!member.roles.cache.has(r.id)) member.roles.add(r);
						}, j*member.giveTheseRoles.length);
					}
					for (let j = 0; j < member.removeTheseRoles.length; j++) {
						setTimeout(() => {
							if (member.roles.cache.has(r.id)) member.roles.remove(r);
						}, j*member.removeTheseRoles.length);
					}
				}, timeOut);
			}
		}
		return [TotalLength, uniqueMembers.length];
	}
};