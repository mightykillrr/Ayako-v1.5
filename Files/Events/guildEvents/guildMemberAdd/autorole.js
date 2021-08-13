module.exports = {
	// eslint-disable-next-line no-unused-vars
	async execute(member, user) {
		const client = user.client;
		const ch = client.ch;
		const guild = member.guild;
		const res = await ch.query('SELECT * FROM autorole WHERE guildid = $1;', [guild.id]);
		if (res && res.rowCount > 0) {
			for (let i = 0; i < +res.rowCount; i++) {
				const r = res.rows[i];
				const role = guild.roles.cache.get(r.roleid);
				client.ch.role(member, role, 1, 'add');
			} 
		}   
	}
};