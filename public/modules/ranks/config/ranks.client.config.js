'use strict';

// Configuring the Articles module
angular.module('ranks').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Ranks', 'ranks', 'dropdown', '/ranks(/create)?');
		Menus.addSubMenuItem('topbar', 'ranks', 'List Ranks', 'ranks');
		Menus.addSubMenuItem('topbar', 'ranks', 'New Rank', 'ranks/create');
	}
]);