'use strict';

//Setting up route
angular.module('ranks').config(['$stateProvider',
	function($stateProvider) {
		// Ranks state routing
		$stateProvider.
		state('listRanks', {
			url: '/ranks',
			templateUrl: 'modules/ranks/views/list-ranks.client.view.html'
		}).
		state('createRank', {
			url: '/ranks/create',
			templateUrl: 'modules/ranks/views/create-rank.client.view.html'
		}).
		state('viewRank', {
			url: '/ranks/:rankId',
			templateUrl: 'modules/ranks/views/view-rank.client.view.html'
		}).
		state('editRank', {
			url: '/ranks/:rankId/edit',
			templateUrl: 'modules/ranks/views/edit-rank.client.view.html'
		});
	}
]);