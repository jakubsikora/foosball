'use strict';


angular.module('core').controller('HomeController', ['$scope', '$q', 'Authentication', 'Ranks',
	function($scope, $q, Authentication, Ranks) {
    // This provides Authentication context.
		$scope.authentication = Authentication;

    $scope.data = {};
    $scope.data.ranks = Ranks.query();
	}
]);