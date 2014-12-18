'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Rank Schema
 */
var RankSchema = new Schema({
	player: {
		type: String,
		default: '',
		required: 'Please fill player name',
		trim: true
	},
	rank: {
		type: Number,
		default: '1000',
		trim: true
	},
	games: {
		type: Number,
		default: '0',
		trim: true
	},
	wins: {
		type: Number,
		default: '0',
		trim: true
	},
	loses: {
		type: Number,
		default: '0',
		trim: true
	},
	change: {
		type: Number,
		default: '0',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Rank', RankSchema);