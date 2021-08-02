const {parentPort, workerData} = require('worker_threads');

parentPort.postMessage(getMembers(workerData.members, workerData.roles));


function getMembers(members, roles) {
	const membersWithRoles = new Array;
	for (let i = 0; members.length > i; i++) {
		const member = members[i][1];
		roles.forEach(roleArr => {
			const sepID = roleArr[0];
			const roleIDArr = roleArr[1];
			let getsThisSep = false;
			member._roles.forEach(r => {
				if (roleIDArr.includes(r)) getsThisSep = true;
			});
			if (getsThisSep) member.giveTheseRoles ? member.giveTheseRoles.push(sepID) : member.giveTheseRoles = [sepID]; 
			const loosesThisSep = [];
			roleIDArr.forEach(r => {
				if (member._roles.includes(r)) loosesThisSep.push(false);
				else loosesThisSep.push(true);
			});
			if (loosesThisSep.includes(false)) member.removeTheseRoles ? member.removeTheseRoles.push(sepID) : member.removeTheseRoles = [sepID];
			if (member.removeTheseRoles || member.giveTheseRoles) membersWithRoles.push(member);
		});
	}
	return membersWithRoles;
}