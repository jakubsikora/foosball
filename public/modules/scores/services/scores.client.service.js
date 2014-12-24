'use strict';

//Scores service used to communicate Scores REST endpoints
angular.module('scores').factory('Scores', ['$resource',
	function($resource) {
		return $resource('scores/:scoreId', { scoreId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);