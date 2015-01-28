'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var ScoreSchema = new Schema({
  teamA: {
    type: Array,
    required: 'Team A is required'
  },
  teamB: {
    type: Array,
    required: 'Team B is required'
  },
  teamAScore: {
    type: Number,
    default: 0,
    required: 'Team A Score is required'
  },
  teamBScore: {
    type: Number,
    default: 0,
    required: 'Team B Score is required'
  },
  saved: {
    type: Date,
    default: Date.now
  }
  // TODO: user through basic auth
  // user: {
  //  type: Schema.ObjectId,
  //  ref: 'User'
  // }
});

mongoose.model('Score', ScoreSchema);
