'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors'),
	Score = mongoose.model('Score'),
	_ = require('lodash');

/**
 * Create a Score
 */
exports.create = function(req, res) {
	var score = new Score(req.body);
	score.user = req.user;

	score.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(score);
		}
	});
};

/**
 * Show the current Score
 */
exports.read = function(req, res) {
	res.jsonp(req.score);
};

/**
 * Update a Score
 */
exports.update = function(req, res) {
	var score = req.score ;

	score = _.extend(score , req.body);

	score.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(score);
		}
	});
};

/**
 * Delete an Score
 */
exports.delete = function(req, res) {
	var score = req.score ;

	score.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(score);
		}
	});
};

/**
 * List of Scores
 */
exports.list = function(req, res) { Score.find().sort('-saved').populate('user', 'displayName').exec(function(err, scores) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(scores);
		}
	});
};

/**
 * Score middleware
 */
exports.scoreByID = function(req, res, next, id) { Score.findById(id).populate('user', 'displayName').exec(function(err, score) {
		if (err) return next(err);
		if (! score) return next(new Error('Failed to load Score ' + id));
		req.score = score ;
		next();
	});
};

/**
 * Score authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.score.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};