'use strict';

//Setting up route
angular.module('scores').config(['$stateProvider',
	function($stateProvider) {
		// Scores state routing
		$stateProvider.
		state('listScores', {
			url: '/scores',
			templateUrl: 'modules/scores/views/list-scores.client.view.html'
		}).
		state('createScore', {
			url: '/scores/create',
			templateUrl: 'modules/scores/views/create-score.client.view.html'
		}).
		state('viewScore', {
			url: '/scores/:scoreId',
			templateUrl: 'modules/scores/views/view-score.client.view.html'
		}).
		state('editScore', {
			url: '/scores/:scoreId/edit',
			templateUrl: 'modules/scores/views/edit-score.client.view.html'
		});
	}
]);