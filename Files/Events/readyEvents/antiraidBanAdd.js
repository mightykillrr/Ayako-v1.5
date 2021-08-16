const Discord = require('discord.js');
const UserCache = new Discord.Collection();
const { client } = require('../../BaseClient/DiscordClient');

module.exports = {
	execute() {
		UserCache.map(o => o).forEach((obj) => {
			obj.joins.forEach((users) => {
				if (users.sorted.length > 10) banThese(users);
			});
		});
		function banThese(users) {
			const guild = client.guilds.cache.get(users.guild);
			if (guild) {
				users.sorted.forEach(async (userID) => {
					const user = client.users.cache.get(userID), msg = new Object;
					msg.language = await client.ch.languageSelector(guild), msg.client = client;
					client.emit('modBanAdd', client.user, user, msg.language.autotypes.antiraid, msg);
				});
			}
		}
	},
	async add(users) {
		users.forEach((user) => {
			if (UserCache.get(users[0].guild)) {
				if (UserCache.get(users[0].guild).joins.get(user.id.slice(0, 3))) UserCache.get(users[0].guild).joins.get(user.id.slice(0, 3)).sorted.push(user.id);
				else UserCache.get(users[0].guild).joins.set(user.id.slice(0, 3), {guild: user.guild, sorted: [user.id]});
			} else UserCache.set(users[0].guild, {joins: new Discord.Collection().set(user.id.slice(0, 3), {guild: user.guild, sorted: [user.id]})});
		});
	}
};