'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Rank = mongoose.model('Rank'),
	_ = require('lodash');

/**
 * Create a Rank
 */
exports.create = function(req, res) {
	var rank = new Rank(req.body);
	rank.user = req.user;

	rank.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(rank);
		}
	});
};

/**
 * Show the current Rank
 */
exports.read = function(req, res) {
	res.jsonp(req.rank);
};

/**
 * Update a Rank
 */
exports.update = function(req, res) {
	var rank = req.rank ;

	rank = _.extend(rank , req.body);

	rank.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(rank);
		}
	});
};

/**
 * Delete an Rank
 */
exports.delete = function(req, res) {
	var rank = req.rank ;

	rank.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(rank);
		}
	});
};

/**
 * List of Ranks
 */
exports.list = function(req, res) { Rank.find().sort('-created').populate('user', 'displayName').exec(function(err, ranks) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(ranks);
		}
	});
};

/**
 * Rank middleware
 */
exports.rankByID = function(req, res, next, id) { Rank.findById(id).populate('user', 'displayName').exec(function(err, rank) {
		if (err) return next(err);
		if (! rank) return next(new Error('Failed to load Rank ' + id));
		req.rank = rank ;
		next();
	});
};

/**
 * Rank authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.rank.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};