const { parentPort, workerData } = require('worker_threads');
getMembers(workerData);

async function getMembers(wd) {
	const res = wd.res, obj = wd.obj;
	setTimeout(() => {
		parentPort.postMessage('timeout');
		clearInterval(int);
		// eslint-disable-next-line no-undef
		process.exit();
	}, obj.members.length/10);
	const roles = new Array;
	if (res && res.length > 0) {
		res.forEach(async (row) => {
			let tempRoles = new Array;
			const separator = obj.separators.find(ob => ob.separator.id == row.separator).separator;
			if (row.isvarying) {
				const stopRole = obj.separators.find(ob => ob.stoprole && row.stoprole && ob.stoprole.id == row.stoprole)?.stoprole;
				if (row.stoprole && stopRole) {
					if (stopRole.rawPosition > separator.rawPosition) tempRoles = obj.roles.filter(r => r.rawPosition < stopRole.rawPosition && r.rawPosition > separator.rawPosition && r.id !== stopRole.id && r.id !== separator.id);
					else if (stopRole.rawPosition < separator.rawPosition) tempRoles = obj.roles.filter(r => r.rawPosition > stopRole.rawPosition && r.rawPosition < separator.rawPosition && r.id !== stopRole.id && r.id !== separator.id);
				} else tempRoles = obj.roles.filter(r => r.rawPosition < obj.highestRole.rawPosition && r.rawPosition > separator.rawPosition && r.id !== separator.id);
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
				const loosesThisSep = [];
				member.roles.forEach(r => {
					if (roleArr.affectedRoles.includes(r.id)) getsThisSep = true;
				});
				if (getsThisSep) member.giveTheseRoles ? member.giveTheseRoles.push(roleArr.id) : member.giveTheseRoles = [roleArr.id]; 
				roleArr.affectedRoles.forEach(r => {
					const temp = member.roles.filter(mr => mr.id == r);
					if (temp && temp.length > 0) loosesThisSep.push(false);
					else loosesThisSep.push(true);
				});
				if (loosesThisSep.includes(true)) member.removeTheseRoles ? member.removeTheseRoles.push(roleArr.id) : member.removeTheseRoles = [roleArr.id];
				if (member.removeTheseRoles || member.giveTheseRoles) {
					if (member.giveTheseRoles && member.giveTheseRoles.length > 0) member.giveTheseRoles.forEach(r => {
						if (member.removeTheseRoles.includes(r)) member.removeTheseRoles.splice(member.removeTheseRoles.indexOf(r), 1);
					});
					if (member.removeTheseRoles && member.removeTheseRoles.length > 0) member.removeTheseRoles.forEach(r => {
						if (!member.roles.includes(r)) member.removeTheseRoles.splice(member.removeTheseRoles.indexOf(r), 1);
					});
					membersWithRoles.push(member);
				}
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
}
