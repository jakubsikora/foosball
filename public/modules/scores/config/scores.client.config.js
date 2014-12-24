'use strict';

// Configuring the Articles module
angular.module('scores').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Scores', 'scores', 'dropdown', '/scores(/create)?');
		Menus.addSubMenuItem('topbar', 'scores', 'List Scores', 'scores');
		Menus.addSubMenuItem('topbar', 'scores', 'New Score', 'scores/create');
	}
]);