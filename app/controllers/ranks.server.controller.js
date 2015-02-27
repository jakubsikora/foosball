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
          .join('');

        var realForm = playerRanks
          .filter(function(playerRank) {
            return playerRank.form !== '-';
          })
          .map(function(playerRank) {
            return playerRank.form;
          });

        var last10Form = {
          W: 0,
          L: 0
        };

        realForm.slice(-10).forEach(function(form) {
          if (form === 'W') last10Form.W++;
          if (form === 'L') last10Form.L++;
        });

        var streak = null;
        realForm.forEach(function(form) {
          if (!streak) {
            streak = form;

          } else {
            if (!!~streak.indexOf(form)) {
              streak += form;
            } else {
              streak = form;
            }
          }
        });

        return {
          team: player,
          rank: currentRank.rank,
          games: currentRank.played,
          wins: currentRank.wins,
          loses: currentRank.loses,
          pct: currentRank.wins / currentRank.played,
          form: form,
          last10Form: last10Form,
          streak: streak.length + ' ' + streak.charAt(0),
          last: currentRank.score.saved,
          change: currentRank.rank - previousRank.rank,
          penalty: currentRank.penalty
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