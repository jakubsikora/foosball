'use strict';

//Scores service used to communicate Scores REST endpoints
angular.module('scores')

  .factory('Scores', ['$resource',
    function($resource) {
      return $resource('scores/:scoreId', { scoreId: '@_id'
      }, {
        update: {
          method: 'PUT'
        }
      });
    }
  ])

  // TODO: this is on the server and the client
  .service('scoreUtils', [function() {
    var findTeamPlayers = function(team) {
      return sortTeam(team.split(/,|and| /).filter(function(player) {
        return player !== '';
      }));
    };

    var sortTeam = function(team) {
      var sorted = team.slice();

      return sorted.sort(function(a, b) {
        return a.replace(/^@/, '').localeCompare(b.replace(/^@/, ''));
      });
    };

    var teamKey = function(team) {
      return sortTeam(team).join(', ');
    };

    // Compare teamA to teamB
    // fuzzy mode makes teamB match teamA is teamB is a superset
    var teamsMatch = function(teamA, teamB, fuzzy) {
      if (fuzzy) {
        // Make sure teamB contains all of teamA
        return teamA.every(function(player) {
          return teamB.indexOf(player) !== -1;
        });
      } else {
        // Make sure the teams are an exact match
        return teamKey(teamA) === teamKey(teamB);
      }
    };

    var byTeam = function(team, fuzzy) {
      return function(game) {
        var isTeamA = teamsMatch(team, game.teamA, fuzzy)
          , isTeamB = teamsMatch(team, game.teamB, fuzzy);

        return isTeamA || isTeamB;
      };
    };

    var byWin = function(team, fuzzy) {
      return function(game) {
        var isTeamA = teamsMatch(team, game.teamA, fuzzy)
          , isTeamB = teamsMatch(team, game.teamB, fuzzy)
          , teamABeatTeamB = game.teamAScore > game.teamBScore
          , teamBBeatTeamA = game.teamBScore > game.teamAScore;

        return (isTeamA && teamABeatTeamB) || (isTeamB && teamBBeatTeamA);
      };
    };

    var byLose = function(team, fuzzy) {
      return function(game) {
        var isTeamA = teamsMatch(team, game.teamA, fuzzy)
          , isTeamB = teamsMatch(team, game.teamB, fuzzy)
          , teamABeatTeamB = game.teamAScore > game.teamBScore
          , teamBBeatTeamA = game.teamBScore > game.teamAScore;

        return (isTeamA && teamBBeatTeamA) || (isTeamB && teamABeatTeamB);
      };
    };

    var byDraw = function() {
      return function(game) {
        return game.teamAScore === game.teamBScore;
      };
    };

    var percent = function(portion, of) {
      if (of === 0) return 0;

      return (portion / of) * 100;
    };

    var decimal = function(val, precision) {
      return val.toFixed(precision > -1 ? precision : 2);
    };

    var mapTeamA = function(game) {
      return game.teamA;
    };

    var mapTeamB = function(game) {
      return game.teamB;
    };

    var findTeam = function(team, teams, fuzzy) {
      return !teams.every(function(otherTeam) {
        return !teamsMatch(team, otherTeam, fuzzy);
      });
    };

    var uniqueTeams = function(allTeams) {
      return allTeams.reduce(function(teams, team) {
        if (!findTeam(team, teams)) teams.push(team);
        return teams;
      }, []);
    };

    var getTeams = function(games) {
      var aTeams = games.map(mapTeamA)
        , bTeams = games.map(mapTeamB)
        , teams = aTeams.concat(bTeams);

      return uniqueTeams(teams);
    };

    // uniquePlayers is basically just uniqueTeams but with a flattened list
    var uniquePlayers = function(allTeams) {
      return uniqueTeams([].concat.apply([], allTeams).map(function(player) {
        return [player];
      })).map(function(players) {
        return players[0];
      });
    };

    var getPlayers = function(games) {
      var aTeams = games.map(mapTeamA)
        , bTeams = games.map(mapTeamB)
        , teams = aTeams.concat(bTeams);

      return sortTeam(uniquePlayers(teams));
    };

    var getTeamGames = function(games, team, fuzzy) {
      return games.filter(byTeam(team, fuzzy));
    };

    var getTeamStats = function(games, team, fuzzy) {
      var teamGames = getTeamGames(games, team, fuzzy)
        , wins = teamGames.filter(byWin(team, fuzzy))
        , loses = teamGames.filter(byLose(team, fuzzy))
        , draws = teamGames.filter(byDraw());

      return {
        played: teamGames.length,
        wins: wins.length,
        loses: loses.length,
        draws: draws.length,
        winPercent: percent(wins.length, teamGames.length),
        lossPercent: percent(loses.length, teamGames.length),
        drawPercent: percent(draws.length, teamGames.length)
      };
    };

    var sortByRank = function(teamA, teamB) {
      if (teamA.rank > teamB.rank) return 1;
      if (teamA.rank < teamB.rank) return -1;

      return 0;
    };

    var sortByDate = function(scoreA, scoreB) {
      if (scoreA.date > scoreB.date) return 1;
      if (scoreA.date < scoreB.date) return -1;

      return 0;
    };

    return {
      findTeamPlayers: findTeamPlayers,
      sortTeam: sortTeam,
      teamKey: teamKey,
      teamsMatch: teamsMatch,
      byTeam: byTeam,
      byWin: byWin,
      byLose: byLose,
      byDraw: byDraw,
      percent: percent,
      decimal: decimal,
      mapTeamA: mapTeamA,
      mapTeamB: mapTeamB,
      findTeam: findTeam,
      uniqueTeams: uniqueTeams,
      getTeams: getTeams,
      uniquePlayers: uniquePlayers,
      getPlayers: getPlayers,
      getTeamGames: getTeamGames,
      getTeamStats: getTeamStats
    };
  }]);

console.log('foo');