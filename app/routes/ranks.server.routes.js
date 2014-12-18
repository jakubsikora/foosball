'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users');
	var ranks = require('../../app/controllers/ranks');

	// Ranks Routes
	app.route('/ranks')
		.get(ranks.list)
		.post(ranks.create);

	app.route('/ranks/:rankId')
		.get(ranks.read)
		.put(users.requiresLogin, ranks.hasAuthorization, ranks.update)
		.delete(users.requiresLogin, ranks.hasAuthorization, ranks.delete);

	// Finish by binding the Rank middleware
	app.param('rankId', ranks.rankByID);
};