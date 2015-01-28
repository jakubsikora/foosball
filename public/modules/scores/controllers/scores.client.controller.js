'use strict';

// Scores controller
angular.module('scores').controller('ScoresController', ['$scope', '$stateParams', '$location', 'Authentication', 'Scores', 'scoreUtils',
	function($scope, $stateParams, $location, Authentication, Scores, scoreUtils) {
    var updatePlayers = function() {
      var players = $scope.data.players;

      players.teamAAvailable = players.all.filter(function(player) {
        return $scope.teamA.indexOf(player) === -1
          && $scope.teamB.indexOf(player) === -1;
      });

      players.teamBAvailable = players.all.filter(function(player) {
        return $scope.teamA.indexOf(player) === -1
          && $scope.teamB.indexOf(player) === -1;
      });
    };

		$scope.authentication = Authentication;

    $scope.teamA = [];
    $scope.teamB = [];

    $scope.data = {
      scores: Scores.query(),
      players: {
        all: [],
        teamAAvailable: [],
        teamBAvailable: []
      }
    };

    $scope.data.scores.$promise.then(function(scores) {
      $scope.data.players.all = scoreUtils.getPlayers(scores);

      updatePlayers();
    });

    $scope.addPlayer = function(team, player) {
      $scope[team].push(player);

      updatePlayers();
    };

    $scope.removePlayer = function(team, player) {
      $scope[team] = $scope[team].filter(function(otherPlayer) {
        return otherPlayer !== player;
      });

      updatePlayers();
    };

    // Create new Score
    $scope.create = function() {
      // Create new Score object
      var score = new Scores({
        teamA: this.teamA,
        teamB: this.teamB,
        teamAScore: this.teamAScore,
        teamBScore: this.teamBScore
      });

      // Redirect after save
      score.$save(function(response) {
        $location.path('scores');
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Score
    $scope.remove = function(score) {
      if (score) {
        score.$remove();

        for (var i in $scope.scores) {
          if ($scope.scores [i] === score) {
            $scope.scores.splice(i, 1);
          }
        }
      } else {
        $scope.score.$remove(function() {
          $location.path('scores');
        });
      }
    };

    // Update existing Score
    $scope.update = function() {
      var score = $scope.score;

      score.$update(function() {
        $location.path('scores/' + score._id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Scores
    $scope.find = function() {
      $scope.scores = Scores.query();
    };

    // Find existing Score
    $scope.findOne = function() {
      $scope.score = Scores.get({
        scoreId: $stateParams.scoreId
      });
    };
  }
]);