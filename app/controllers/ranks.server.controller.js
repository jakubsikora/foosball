'use strict';

var mongoose = require('mongoose')
  , errorHandler = require('./errors')
  , elo = require('elo-rank')(15)
  , Score = mongoose.model('Score')
  , librank = require('../utils/rank');

exports.list = function(req, res) {
  Score.find().sort('saved').exec(function(err, scores) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    var ranks = librank.getRanks(scores);

    // Parse object into an array
    var rankArr = Object.keys(ranks)
      .map(function(player) {
        var playerRanks = ranks[player]
          , currentRank = playerRanks[playerRanks.length - 1]
          , previousRank = currentRank.previous;

        var form = playerRanks
          .map(function(playerRank) {
            return playerRank.form;
          })
          .join('')
          .slice(-5);

        return {
          team: player,
          rank: currentRank.rank,
          games: currentRank.played,
          wins: currentRank.wins,
          loses: currentRank.loses,
          form: form,
          last: currentRank.score.saved,
          change: currentRank.rank - previousRank.rank
        };
      })
      .sort(function sortByRank(teamA, teamB) {
        if (teamA.rank > teamB.rank) return 1;
        if (teamA.rank < teamB.rank) return -1;
        return 0;
      })
      .reverse();

    res.jsonp(rankArr);
  });
};