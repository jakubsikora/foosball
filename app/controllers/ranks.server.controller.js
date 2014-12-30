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
      , teamAP1
      , teamAP2
      , teamBP1
      , teamBP2
      , teamARankAvg
      , teamBRankAvg
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
              loses: 0,
              form: '',
              last: null
            };
          }

          if (!rank[teamB]) {
           rank[teamB] = {
              rank: defaultRank,
              games: 0,
              wins: 0,
              loses: 0,
              form: '',
              last: null
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

            rank[teamA]['form'] += 'W';
            rank[teamB]['form'] += 'L';

            rank[teamA]['last'] = score.saved;
            rank[teamB]['last'] = score.saved;
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

            rank[teamA]['form'] += 'L';
            rank[teamB]['form'] += 'W';

            rank[teamA]['last'] = score.saved;
            rank[teamB]['last'] = score.saved;
          }
        }
              // Doubles
      else if (score.teamA.length > 1 && score.teamB.length > 1) {
        // Proxy
        teamA = score.teamA;
        teamB = score.teamB;
        teamAP1 = teamA[0];
        teamAP2 = teamA[1];
        teamBP1 = teamB[0];
        teamBP2 = teamB[1];
        teamAScore = score.teamAScore;
        teamBScore = score.teamBScore;

        // Set initial values
        if (!rank[teamAP1]) {
          rank[teamAP1] = {
            rank: defaultRank,
            games: 0,
            wins: 0,
            loses: 0,
            form: '',
            last: null
          };
        }

        if (!rank[teamAP2]) {
          rank[teamAP2] = {
            rank: defaultRank,
            games: 0,
            wins: 0,
            loses: 0,
            form: '',
            last: null
          };
        }

        if (!rank[teamBP1]) {
         rank[teamBP1] = {
            rank: defaultRank,
            games: 0,
            wins: 0,
            loses: 0,
            form: '',
            last: null
          };
        }

        if (!rank[teamBP2]) {
         rank[teamBP2] = {
            rank: defaultRank,
            games: 0,
            wins: 0,
            loses: 0,
            form: '',
            last: null
          };
        }

        teamARankAvg = (rank[teamAP1]['rank'] + rank[teamAP2]['rank']) / 2;
        teamBRankAvg = (rank[teamBP1]['rank'] + rank[teamBP2]['rank']) / 2;

        // Store previous rank
        rank[teamAP1]['rank_before'] = rank[teamAP1]['rank'];
        rank[teamAP2]['rank_before'] = rank[teamAP2]['rank'];
        rank[teamBP1]['rank_before'] = rank[teamBP1]['rank'];
        rank[teamBP2]['rank_before'] = rank[teamBP2]['rank'];

        // Calculate ranking when teamA wins
        if (teamAScore > teamBScore) {
          resultRank = calculate(
            rank[teamAP1]['rank'], teamBRankAvg, true, false);
          rank[teamAP1]['rank'] = resultRank[0];

          resultRank = calculate(
            rank[teamAP2]['rank'], teamBRankAvg, true, false);
          rank[teamAP2]['rank'] = resultRank[0];

          resultRank = calculate(
            rank[teamBP1]['rank'], teamARankAvg, false, true);
          rank[teamBP1]['rank'] = resultRank[0];

          resultRank = calculate(
            rank[teamBP2]['rank'], teamARankAvg, false, true);
          rank[teamBP2]['rank'] = resultRank[0];

          rank[teamAP1]['games'] = rank[teamAP1]['games'] + 1 || 1;
          rank[teamAP2]['games'] = rank[teamAP2]['games'] + 1 || 1;
          rank[teamBP1]['games'] = rank[teamBP1]['games'] + 1 || 1;
          rank[teamBP2]['games'] = rank[teamBP2]['games'] + 1 || 1;

          rank[teamAP1]['wins'] = rank[teamAP1]['wins'] + 1 || 1;
          rank[teamAP2]['wins'] = rank[teamAP2]['wins'] + 1 || 1;
          rank[teamBP1]['loses'] = rank[teamBP1]['loses'] + 1 || 1;
          rank[teamBP2]['loses'] = rank[teamBP2]['loses'] + 1 || 1;

          rank[teamAP1]['form'] += 'W';
          rank[teamAP2]['form'] += 'W';
          rank[teamBP1]['form'] += 'L';
          rank[teamBP2]['form'] += 'L';

          rank[teamAP1]['last'] = score.saved;
          rank[teamAP1]['last'] = score.saved;
          rank[teamBP1]['last'] = score.saved;
          rank[teamBP1]['last'] = score.saved;
        } // Calculate ranking when teamB wins
        else if (teamAScore < teamBScore) {
          resultRank = calculate(
            rank[teamAP1]['rank'], teamBRankAvg, false, true);
          rank[teamAP1]['rank'] = resultRank[0];

          resultRank = calculate(
            rank[teamAP2]['rank'], teamBRankAvg, false, true);
          rank[teamAP2]['rank'] = resultRank[0];

          resultRank = calculate(
            rank[teamBP1]['rank'], teamARankAvg, true, false);
          rank[teamBP1]['rank'] = resultRank[0];

          resultRank = calculate(
            rank[teamBP2]['rank'], teamARankAvg, true, false);
          rank[teamBP2]['rank'] = resultRank[0];

          rank[teamAP1]['games'] = rank[teamAP1]['games'] + 1 || 1;
          rank[teamAP2]['games'] = rank[teamAP2]['games'] + 1 || 1;
          rank[teamBP1]['games'] = rank[teamBP1]['games'] + 1 || 1;
          rank[teamBP2]['games'] = rank[teamBP2]['games'] + 1 || 1;

          rank[teamAP1]['loses'] = rank[teamAP1]['loses'] + 1 || 1;
          rank[teamAP2]['loses'] = rank[teamAP2]['loses'] + 1 || 1;
          rank[teamBP1]['wins'] = rank[teamBP1]['wins'] + 1 || 1;
          rank[teamBP2]['wins'] = rank[teamBP2]['wins'] + 1 || 1;

          rank[teamAP1]['form'] += 'L';
          rank[teamAP2]['form'] += 'L';
          rank[teamBP1]['form'] += 'W';
          rank[teamBP2]['form'] += 'W';

          rank[teamAP1]['last'] = score.saved;
          rank[teamAP1]['last'] = score.saved;
          rank[teamBP1]['last'] = score.saved;
          rank[teamBP1]['last'] = score.saved;
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
            form: rank[team]['form'],
            last: rank[team]['last'],
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