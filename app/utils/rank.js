var libscore = require('./score')
  , elo = require('elo-rank')(15);

var startingRank = 1000
  , inactive = 7 * 24 * 60 * 60 * 1000 /* 7 days in milliseconds */
  , penalty = 10
  , startingForm = '-'
  , winningForm = 'W'
  , losingForm = 'L'
  , drawingForm = 'D'
  , inactiveForm = '-';

/*
ranks will look like: {
  '@steve': [
    { rank: 1000, previous: null, form: '-', played: 0, wins: 0, loses: 0, draws: 0 }
    { rank: 1010, score: { ... }, previous: { ... }, form: 'W', played: 1, wins: 1, loses: 0, draws: 0 },
    { rank: 1000, inactivity: true, previous: { ... }, form: '-', played: 1, wins: 1, loses: 0, draws: 0 },
    { rank: 990, score: { ... }, previous: { ... }, form: 'L', played: 2, wins: 1, loses: 1, draws: 0 }
  ], ...
};
*/
var getRanks = function(scores) {
  var ranks = {};

  libscore
    .getPlayers(scores)
    .forEach(initPlayer(ranks));

  scores
    .sort(libscore.sortByDate)
    .forEach(rankScore(ranks));

  return ranks;
};

var initPlayer = function(ranks) {
  return function(player) {
    return ranks[player] = ranks[player] || [{
      rank: startingRank,
      previous: null,
      form: startingForm,
      played: 0, wins: 0, loses: 0, draws: 0
    }];
  }
};

var rankScore = function(ranks) {
  return function(score) {
    var teamAWon = score.teamAScore > score.teamBScore
      , draw = score.teamAScore === score.teamBScore;

    if (draw) {
      return rankScoreDraw(ranks, score);
    } else if (teamAWon) {
      return rankScoreWin(ranks, score, score.teamA, score.teamB);
    } else {
      return rankScoreWin(ranks, score, score.teamB, score.teamA);
    }
  };
};

var rankScoreDraw = function(ranks, score) {
  var players = score.teamA.concat(score.teamB);

  players.forEach(function(player) {
    var previousRank = currentRank(ranks, player);

    ranks[player].push({
      rank: previousRank.rank,
      score: score,
      previous: previousRank,
      form: drawingForm,
      played: previousRank.rank + 1,
      wins: previousRank.wins,
      loses: previousRank.loses,
      draws: previousRank.draws + 1
    });
  });
};

var rankScoreWin = function(ranks, score, winners, losers) {
  var players = score.teamA.concat(score.teamB);

  // Need to pretend as if each player played all the players from the
  // other team. We do this but putting them against the average
  var winnersAvg = arrayAverage(winners.map(extractRank(ranks)))
    , losersAvg = arrayAverage(losers.map(extractRank(ranks)));

  winners.forEach(function(winner) {
    var winnerCurrentRank = currentRank(ranks, winner)
      , calculatedRank = calculateWin(winnerCurrentRank.rank, losersAvg);

    ranks[winner].push({
      rank: calculatedRank,
      score: score,
      previous: winnerCurrentRank,
      form: winningForm,
      played: winnerCurrentRank.rank + 1,
      wins: winnerCurrentRank.wins + 1,
      loses: winnerCurrentRank.loses,
      draws: winnerCurrentRank.draws
    });
  });

  losers.forEach(function(loser) {
    var loserCurrentRank = currentRank(ranks, loser)
      , calculatedRank = calculateLose(winnersAvg, loserCurrentRank.rank);

    ranks[loser].push({
      rank: calculatedRank,
      score: score,
      previous: loserCurrentRank,
      form: losingForm,
      played: loserCurrentRank.rank + 1,
      wins: loserCurrentRank.wins,
      loses: loserCurrentRank.loses + 1,
      draws: loserCurrentRank.draws
    });
  });
};

var calculateWin = function(winnerRank, looserRank) {
  var expectedScore = elo.getExpected(winnerRank, looserRank);

  return elo.updateRating(expectedScore, 1, winnerRank);
};

var calculateLose = function(winnerRank, looserRank) {
  var expectedScore = elo.getExpected(looserRank, winnerRank);

  return elo.updateRating(expectedScore, 0, looserRank);
};

var currentRank = function(ranks, player) {
  var playerRanks = ranks[player];

  return playerRanks[playerRanks.length - 1];
};

var extractRank = function(ranks) {
  return function(player) {
    return currentRank(ranks, player).rank;
  };
};

var arrayAverage = function(arr) {
  if (!arr.length) return 0;

  var sum = arr.reduce(function(a, b) { return a + b });

  return sum / arr.length;
};

var isInactive = function(player, previousScore, currentScore) {
  if (!previousScore) return false;
  if (previousScore - currentScore > inactive) return true;

  return false;
}

exports.getRanks = getRanks;