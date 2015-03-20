'use strict';


angular.module('core').controller('HomeController', ['$scope', '$q', 'Authentication', 'Ranks',
	function($scope, $q, Authentication, Ranks) {
    // HACK, TODO: create blacklisted model
    var hidePlayers = ['@jonny', '@NathanBuckley'];

    // This provides Authentication context.
		$scope.authentication = Authentication;

    $scope.data = {};

    Ranks.query(function(ranks) {
      $scope.data.ranks = ranks.filter(function(rank) {
        return !~hidePlayers.indexOf(rank.team);
      });
    });
  }
]);