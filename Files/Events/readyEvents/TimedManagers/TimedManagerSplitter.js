module.exports = {
	execute() {
		require('./reminder').execute();
		require('./verification').execute();
		require('./captchaClearer').execute();
		return;
		require('./willis').execute();
		require('./disboard').execute();
		require('./voteReminder').execute();
		require('./mute').execute();
		require('./stats').execute();
	}
};