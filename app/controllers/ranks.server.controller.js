'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose')
  , errorHandler = require('./errors')
  , elo = require('elo-rank')(15)
  , Score = mongoose.model('Score');


exports.list = function(req, res) {
    var that = this
      , rank = {}
      , defaultRank = 1000
      , teamA
      , teamB
      , teamAScore
      , teamBScore
      , resultRank = []
      , rankArr = [];

  Score.find().sort('saved').exec(function(err, scores) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      scores.forEach(function(score) {
        if (score.teamA.length === 1 && score.teamB.length === 1) {
          // Proxy
          teamA = score.teamA;
          teamB = score.teamB;
          teamAScore = score.teamAScore;
          teamBScore = score.teamBScore;

          // Set initial values
          if (!rank[teamA]) {
            rank[teamA] = {
              rank: defaultRank,
              games: 0,
              wins: 0,
              loses: 0
            };
          }

          if (!rank[teamB]) {
           rank[teamB] = {
              rank: defaultRank,
              games: 0,
              wins: 0,
              loses: 0
            };
          }

          // Store previous rank
          rank[teamA]['rank_before'] = rank[teamA]['rank'];
          rank[teamB]['rank_before'] = rank[teamB]['rank'];

          // Calculate ranking when teamA wins
          if (teamAScore > teamBScore) {
            resultRank = calculate(
              rank[teamA]['rank'], rank[teamB]['rank'], true, false);

            rank[teamA]['rank'] = resultRank[0];
            rank[teamB]['rank'] = resultRank[1];

            rank[teamA]['games'] = rank[teamA]['games'] + 1 || 1;
            rank[teamB]['games'] = rank[teamB]['games'] + 1 || 1;

            rank[teamA]['wins'] = rank[teamA]['wins'] + 1 || 1;
            rank[teamB]['loses'] = rank[teamB]['loses'] + 1 || 1;
          }
          // Calculate ranking when teamB wins
          else if (teamAScore < teamBScore) {
            resultRank = calculate(
              rank[teamA], rank[teamB], false, true);

            rank[teamA]['rank'] = resultRank[0];
            rank[teamB]['rank'] = resultRank[1];

            rank[teamA]['games'] = rank[teamA]['games'] + 1 || 1;
            rank[teamB]['games'] = rank[teamB]['games'] + 1 || 1;

            rank[teamB]['wins'] = rank[teamB]['wins'] + 1 || 1;
            rank[teamA]['loses'] = rank[teamA]['loses'] + 1 || 1;
          }
        }
      });

      // Parse object into an array
      for(var team in rank) {
        if(rank.hasOwnProperty(team)){
          rankArr.push({
            team: team,
            rank: rank[team]['rank'],
            games: rank[team]['games'],
            wins: rank[team]['wins'],
            loses: rank[team]['loses'],
            change: (rank[team]['rank'] - rank[team]['rank_before'])
          });
        }
      }

      // Sort rankArr array by rank value
      rankArr.sort(sortByRank).reverse();

      res.jsonp(rankArr);
    }

    function calculate(teamARank, teamBRank, homeWin, awayWin) {
      //Gets expected score for first parameter
      var expectedScoreA = elo.getExpected(teamARank, teamBRank)
        , expectedScoreB = elo.getExpected(teamBRank, teamARank);

      if (homeWin) {
        //update score, 1 if won 0 if lost
        teamARank = elo.updateRating(expectedScoreA, 1, teamARank);
        teamBRank = elo.updateRating(expectedScoreB, 0, teamBRank);
      } else if (awayWin) {
        //update score, 1 if won 0 if lost
        teamARank = elo.updateRating(expectedScoreA, 0, teamARank);
        teamBRank = elo.updateRating(expectedScoreB, 1, teamBRank);
      }

      return [teamARank, teamBRank];
    };

    function sortByRank(teamA, teamB) {
      if (teamA.rank > teamB.rank) return 1;
      if (teamA.rank < teamB.rank) return -1;
      return 0;
    };
  });
};