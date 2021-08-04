const { parentPort, workerData } = require('worker_threads');
const { client } = require('../../../BaseClient/DiscordClient');
const ch = require('../../../BaseClient/ClientHelper');
client.ch = ch;
getMembers(workerData);

async function getMembers(wd) {
	const res = wd.res, obj = wd.obj;
	const roles = new Array;
	if (res && res.length > 0) {
		res.forEach(async (row) => {
			let tempRoles = new Array;
			const separator = obj.separators.find(ob => ob.separator.id == row.separator).separator;
			if (row.isvarying) {
				const stopRole = obj.separators.find(ob => ob.stoprole && row.stoprole && ob.stoprole == row.stoprole)?.stoprole;
				if (row.stoprole && stopRole) {
					if (stopRole.rawPosition > separator.rawPosition) tempRoles = obj.roles.filter(r => r.rawPosition < stopRole.rawPosition && r.rawPosition > separator.rawPosition && r.id !== stopRole.id && r.id !== separator.id);
					else if (stopRole.rawPosition < separator.rawPosition) tempRoles = obj.roles.filter(r => r.rawPosition > stopRole.rawPosition && r.rawPosition < separator.rawPosition && r.id !== stopRole.id && r.id !== separator.id);
				} else tempRoles = obj.roles.filter(r => r.rawPosition < obj.highestRole.rawPosition && r.rawPosition > separator.rawPosition && r.id !== obj.highestRole.id && r.id !== separator.id);
			} else if (row.isvarying == false) tempRoles = obj.roles.filter(r => row.roles.includes(r.id));
			roles.push({id: separator.id, affectedRoles: tempRoles.map(o => o.id)});
		});
	} else return;
	const membersWithRoles = new Array;
	const promised = await new Promise((resolve,) => {
		for (let i = 0; obj.members.length > i; i++) {
			const member = obj.members[i];
			roles.forEach(roleArr => {
				let getsThisSep = false;
				member.roles.forEach(r => {
					if (roleArr.affectedRoles.includes(r)) getsThisSep = true;
				});
				if (getsThisSep) member.giveTheseRoles ? member.giveTheseRoles.push(roleArr.id) : member.giveTheseRoles = [roleArr.id]; 
				const loosesThisSep = [];
				roleArr.affectedRoles.forEach(r => {
					if (member.roles.includes(r)) loosesThisSep.push(false);
					else loosesThisSep.push(true);
				});
				if (loosesThisSep.includes(false)) member.removeTheseRoles ? member.removeTheseRoles.push(roleArr.id) : member.removeTheseRoles = [roleArr.id];
				if (member.removeTheseRoles || member.giveTheseRoles) membersWithRoles.push(member);
			});
			if (i == obj.members.length-1) resolve(true);
		}
	});
	const int = setInterval(() => {
		if (promised == true) {
			parentPort.postMessage(membersWithRoles);
			clearInterval(int);
		}
	}, 1000);
	setTimeout(() => {
		parentPort.postMessage(false);
		clearInterval(int);
		// eslint-disable-next-line no-undef
		process.exit();
	}, obj.members.length/10);
}
