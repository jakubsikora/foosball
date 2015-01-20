'use strict';

// Scores controller
angular.module('scores').controller('ScoresController', ['$scope', '$stateParams', '$location', 'Authentication', 'Scores', 'scoreUtils',
	function($scope, $stateParams, $location, Authentication, Scores, scoreUtils) {
		$scope.authentication = Authentication;

    $scope.data = {
      scores: Scores.query(),
      players: []
    };

    $scope.data.scores.$promise.then(function(scores) {
      $scope.data.players = scoreUtils.getPlayers(scores);
    });
  }
]);