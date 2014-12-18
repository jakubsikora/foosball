'use strict';

// Ranks controller
angular.module('ranks').controller('RanksController', ['$scope', '$stateParams', '$location', 'Authentication', 'Ranks',
	function($scope, $stateParams, $location, Authentication, Ranks ) {
		$scope.authentication = Authentication;

		// Create new Rank
		$scope.create = function() {
			// Create new Rank object
			var rank = new Ranks ({
				name: this.name
			});

			// Redirect after save
			rank.$save(function(response) {
				$location.path('ranks/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Rank
		$scope.remove = function( rank ) {
			if ( rank ) { rank.$remove();

				for (var i in $scope.ranks ) {
					if ($scope.ranks [i] === rank ) {
						$scope.ranks.splice(i, 1);
					}
				}
			} else {
				$scope.rank.$remove(function() {
					$location.path('ranks');
				});
			}
		};

		// Update existing Rank
		$scope.update = function() {
			var rank = $scope.rank ;

			rank.$update(function() {
				$location.path('ranks/' + rank._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Ranks
		$scope.find = function() {
			$scope.ranks = Ranks.query();
		};

		// Find existing Rank
		$scope.findOne = function() {
			$scope.rank = Ranks.get({
				rankId: $stateParams.rankId
			});
		};
	}
]);

angular.module('ranks').filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
});