'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var scores = require('../../app/controllers/scores');

	// Scores Routes
	app.route('/scores')
		.get(scores.list)
		.post(users.requiresLogin, users.isAdmin, scores.create);

	app.route('/scores/last')
		.delete(scores.deleteLast);

	app.route('/scores/:scoreId')
		.get(scores.read)
		.put(users.requiresLogin, scores.hasAuthorization, scores.update)
		.delete(users.requiresLogin, scores.hasAuthorization, scores.delete);

	// Finish by binding the Score middleware
	app.param('scoreId', scores.scoreByID);
};