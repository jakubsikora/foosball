'use strict';

// Scores controller
angular.module('scores').controller('ScoresController', ['$scope', '$stateParams', '$location', 'Authentication', 'Scores',
	function($scope, $stateParams, $location, Authentication, Scores ) {
		$scope.authentication = Authentication;

    $scope.data = {};
    $scope.data.scores = Scores.query();
  }
]);