'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Score Schema
 */
var ScoreSchema = new Schema({
	teamA: {
		type: Array,
		required: 'Please fill teamA'
	},
	teamB: {
		type: Array,
		required: 'Please fill teamB'
	},
	teamAScore: {
		type: Number,
		default: 0
	},
	teamBScore: {
		type: Number,
		default: 0
	},
	saved: {
		type: Date
	}
	// TODO: user through basic auth
	// user: {
	// 	type: Schema.ObjectId,
	// 	ref: 'User'
	// }
});

mongoose.model('Score', ScoreSchema);