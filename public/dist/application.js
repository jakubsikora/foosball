'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'foosball';
	var applicationModuleVendorDependencies = ['ngResource', 'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  'ui.router', 'ui.bootstrap', 'ui.utils'];

	// Add a new vertical module
	var registerModule = function(moduleName, dependencies) {
		// Create angular module
		angular.module(moduleName, dependencies || []);

		// Add the module to the AngularJS configuration file
		angular.module(applicationModuleName).requires.push(moduleName);
	};

	return {
		applicationModuleName: applicationModuleName,
		applicationModuleVendorDependencies: applicationModuleVendorDependencies,
		registerModule: registerModule
	};
})();
'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider',
	function($locationProvider) {
		$locationProvider.hashPrefix('!');
	}
]);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
	//Fixing facebook bug with redirect
	if (window.location.hash === '#_=_') window.location.hash = '#!';

	//Then init the app
	angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('ranks');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('scores');
'use strict';

// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('steves');
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('home', {
			url: '/',
			templateUrl: 'modules/core/views/home.client.view.html'
		});
	}
]);
'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus',
	function($scope, Authentication, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});
	}
]);
'use strict';


angular.module('core').controller('HomeController', ['$scope', '$q', 'Authentication', 'Ranks',
	function($scope, $q, Authentication, Ranks) {
    // This provides Authentication context.
		$scope.authentication = Authentication;

    $scope.data = {};
    $scope.data.ranks = Ranks.query();
	}
]);
'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [

	function() {
		// Define a set of default roles
		this.defaultRoles = ['*'];

		// Define the menus object
		this.menus = {};

		// A private function for rendering decision 
		var shouldRender = function(user) {
			if (user) {
				if (!!~this.roles.indexOf('*')) {
					return true;
				} else {
					for (var userRoleIndex in user.roles) {
						for (var roleIndex in this.roles) {
							if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
								return true;
							}
						}
					}
				}
			} else {
				return this.isPublic;
			}

			return false;
		};

		// Validate menu existance
		this.validateMenuExistance = function(menuId) {
			if (menuId && menuId.length) {
				if (this.menus[menuId]) {
					return true;
				} else {
					throw new Error('Menu does not exists');
				}
			} else {
				throw new Error('MenuId was not provided');
			}

			return false;
		};

		// Get the menu object by menu id
		this.getMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			return this.menus[menuId];
		};

		// Add new menu object by menu id
		this.addMenu = function(menuId, isPublic, roles) {
			// Create the new menu
			this.menus[menuId] = {
				isPublic: isPublic || false,
				roles: roles || this.defaultRoles,
				items: [],
				shouldRender: shouldRender
			};

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenu = function(menuId) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Return the menu object
			delete this.menus[menuId];
		};

		// Add menu item object
		this.addMenuItem = function(menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Push new menu item
			this.menus[menuId].items.push({
				title: menuItemTitle,
				link: menuItemURL,
				menuItemType: menuItemType || 'item',
				menuItemClass: menuItemType,
				uiRoute: menuItemUIRoute || ('/' + menuItemURL),
				isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].isPublic : isPublic),
				roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].roles : roles),
				position: position || 0,
				items: [],
				shouldRender: shouldRender
			});

			// Return the menu object
			return this.menus[menuId];
		};

		// Add submenu item object
		this.addSubMenuItem = function(menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles, position) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
					// Push new submenu item
					this.menus[menuId].items[itemIndex].items.push({
						title: menuItemTitle,
						link: menuItemURL,
						uiRoute: menuItemUIRoute || ('/' + menuItemURL),
						isPublic: ((isPublic === null || typeof isPublic === 'undefined') ? this.menus[menuId].items[itemIndex].isPublic : isPublic),
						roles: ((roles === null || typeof roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : roles),
						position: position || 0,
						shouldRender: shouldRender
					});
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeMenuItem = function(menuId, menuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
					this.menus[menuId].items.splice(itemIndex, 1);
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		// Remove existing menu object by menu id
		this.removeSubMenuItem = function(menuId, submenuItemURL) {
			// Validate that the menu exists
			this.validateMenuExistance(menuId);

			// Search for menu item to remove
			for (var itemIndex in this.menus[menuId].items) {
				for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
					if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
						this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
					}
				}
			}

			// Return the menu object
			return this.menus[menuId];
		};

		//Adding the topbar menu
		this.addMenu('topbar');
	}
]);
'use strict';

//Ranks service used to communicate Ranks REST endpoints
angular.module('ranks').factory('Ranks', ['$resource',
  function($resource) {
    return $resource('ranks/:rankId', { rankId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
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

    // Create new Score
    $scope.create = function() {
      // Create new Score object
      var score = new Scores({
        teamA: this.teamA,
        teamB: this.teamB,
        teamAScore: this.teamAScore,
        teamBScore: this.teamBScore
      });

      // Redirect after save
      score.$save(function(response) {
        $location.path('scores/' + response._id);

        // Clear form fields
        $scope.teamA = '';
        $scope.teamB = '';
        $scope.teamAScore = 0;
        $scope.teamBScore = 0;
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Score
    $scope.remove = function(score) {
      if (score) {
        score.$remove();

        for (var i in $scope.scores) {
          if ($scope.scores [i] === score) {
            $scope.scores.splice(i, 1);
          }
        }
      } else {
        $scope.score.$remove(function() {
          $location.path('scores');
        });
      }
    };

    // Update existing Score
    $scope.update = function() {
      var score = $scope.score;

      score.$update(function() {
        $location.path('scores/' + score._id);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Scores
    $scope.find = function() {
      $scope.scores = Scores.query();
    };

    // Find existing Score
    $scope.findOne = function() {
      $scope.score = Scores.get({
        scoreId: $stateParams.scoreId
      });
    };
  }
]);
'use strict';

//Scores service used to communicate Scores REST endpoints
angular.module('scores')

  .factory('Scores', ['$resource',
    function($resource) {
      return $resource('scores/:scoreId', { scoreId: '@_id'
      }, {
        update: {
          method: 'PUT'
        }
      });
    }
  ])

  .service('scoreUtils', [function() {
    var findTeamPlayers = function(team) {
      return sortTeam(team.split(/,|and| /).filter(function(player) {
        return player !== '';
      }));
    };

    var sortTeam = function(team) {
      var sorted = team.slice();

      return sorted.sort(function(a, b) {
        return a.localeCompare(b);
      });
    };

    var teamKey = function(team) {
      return sortTeam(team).join(', ');
    };

    // Compare teamA to teamB
    // fuzzy mode makes teamB match teamA is teamB is a superset
    var teamsMatch = function(teamA, teamB, fuzzy) {
      if (fuzzy) {
        // Make sure teamB contains all of teamA
        return teamA.every(function(player) {
          return teamB.indexOf(player) !== -1;
        });
      } else {
        // Make sure the teams are an exact match
        return teamKey(teamA) === teamKey(teamB);
      }
    };

    var byTeam = function(team, fuzzy) {
      return function(game) {
        var isTeamA = teamsMatch(team, game.teamA, fuzzy)
          , isTeamB = teamsMatch(team, game.teamB, fuzzy);

        return isTeamA || isTeamB;
      };
    };

    var byWin = function(team, fuzzy) {
      return function(game) {
        var isTeamA = teamsMatch(team, game.teamA, fuzzy)
          , isTeamB = teamsMatch(team, game.teamB, fuzzy)
          , teamABeatTeamB = game.teamAScore > game.teamBScore
          , teamBBeatTeamA = game.teamBScore > game.teamAScore;

        return (isTeamA && teamABeatTeamB) || (isTeamB && teamBBeatTeamA);
      };
    };

    var byLose = function(team, fuzzy) {
      return function(game) {
        var isTeamA = teamsMatch(team, game.teamA, fuzzy)
          , isTeamB = teamsMatch(team, game.teamB, fuzzy)
          , teamABeatTeamB = game.teamAScore > game.teamBScore
          , teamBBeatTeamA = game.teamBScore > game.teamAScore;

        return (isTeamA && teamBBeatTeamA) || (isTeamB && teamABeatTeamB);
      };
    };

    var byDraw = function() {
      return function(game) {
        return game.teamAScore === game.teamBScore;
      };
    };

    var percent = function(portion, of) {
      if (of === 0) return 0;

      return (portion / of) * 100;
    };

    var decimal = function(val, precision) {
      return val.toFixed(precision > -1 ? precision : 2);
    };

    var mapTeamA = function(game) {
      return game.teamA;
    };

    var mapTeamB = function(game) {
      return game.teamB;
    };

    var findTeam = function(team, teams, fuzzy) {
      return !teams.every(function(otherTeam) {
        return !teamsMatch(team, otherTeam, fuzzy);
      });
    };

    var uniqueTeams = function(allTeams) {
      return allTeams.reduce(function(teams, team) {
        if (!findTeam(team, teams)) teams.push(team);
        return teams;
      }, []);
    };

    var getTeams = function(games) {
      var aTeams = games.map(mapTeamA)
        , bTeams = games.map(mapTeamB)
        , teams = aTeams.concat(bTeams);

      return uniqueTeams(teams);
    };

    // uniquePlayers is basically just uniqueTeams but with a flattened list
    var uniquePlayers = function(allTeams) {
      return uniqueTeams([].concat.apply([], allTeams).map(function(player) {
        return [player];
      })).map(function(players) {
        return players[0];
      });
    };

    var getPlayers = function(games) {
      var aTeams = games.map(mapTeamA)
        , bTeams = games.map(mapTeamB)
        , teams = aTeams.concat(bTeams);

      return uniquePlayers(teams);
    };

    var getTeamGames = function(games, team, fuzzy) {
      return games.filter(byTeam(team, fuzzy));
    };

    var getTeamStats = function(games, team, fuzzy) {
      var teamGames = getTeamGames(games, team, fuzzy)
        , wins = teamGames.filter(byWin(team, fuzzy))
        , loses = teamGames.filter(byLose(team, fuzzy))
        , draws = teamGames.filter(byDraw());

      return {
        played: teamGames.length,
        wins: wins.length,
        loses: loses.length,
        draws: draws.length,
        winPercent: percent(wins.length, teamGames.length),
        lossPercent: percent(loses.length, teamGames.length),
        drawPercent: percent(draws.length, teamGames.length)
      };
    };

    var sortByRank = function(teamA, teamB) {
      if (teamA.rank > teamB.rank) return 1;
      if (teamA.rank < teamB.rank) return -1;
      return 0;
    };

    return {
      findTeamPlayers: findTeamPlayers,
      sortTeam: sortTeam,
      teamKey: teamKey,
      teamsMatch: teamsMatch,
      byTeam: byTeam,
      byWin: byWin,
      byLose: byLose,
      byDraw: byDraw,
      percent: percent,
      decimal: decimal,
      mapTeamA: mapTeamA,
      mapTeamB: mapTeamB,
      findTeam: findTeam,
      uniqueTeams: uniqueTeams,
      getTeams: getTeams,
      uniquePlayers: uniquePlayers,
      getPlayers: getPlayers,
      getTeamGames: getTeamGames,
      getTeamStats: getTeamStats
    };
  }]);

console.log('foo');
'use strict';

// Configuring the Articles module
angular.module('steves').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Steves', 'steves', 'dropdown', '/steves(/create)?');
		Menus.addSubMenuItem('topbar', 'steves', 'List Steves', 'steves');
		Menus.addSubMenuItem('topbar', 'steves', 'New Steve', 'steves/create');
	}
]);
'use strict';

//Setting up route
angular.module('steves').config(['$stateProvider',
	function($stateProvider) {
		// Steves state routing
		$stateProvider.
		state('listSteves', {
			url: '/steves',
			templateUrl: 'modules/steves/views/list-steves.client.view.html'
		}).
		state('createSteve', {
			url: '/steves/create',
			templateUrl: 'modules/steves/views/create-steve.client.view.html'
		}).
		state('viewSteve', {
			url: '/steves/:steveId',
			templateUrl: 'modules/steves/views/view-steve.client.view.html'
		}).
		state('editSteve', {
			url: '/steves/:steveId/edit',
			templateUrl: 'modules/steves/views/edit-steve.client.view.html'
		});
	}
]);
'use strict';

// Steves controller
angular.module('steves').controller('StevesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Steves',
	function($scope, $stateParams, $location, Authentication, Steves) {
		$scope.authentication = Authentication;

		// Create new Steve
		$scope.create = function() {
			// Create new Steve object
			var steve = new Steves ({
				name: this.name
			});

			// Redirect after save
			steve.$save(function(response) {
				$location.path('steves/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Steve
		$scope.remove = function(steve) {
			if ( steve ) { 
				steve.$remove();

				for (var i in $scope.steves) {
					if ($scope.steves [i] === steve) {
						$scope.steves.splice(i, 1);
					}
				}
			} else {
				$scope.steve.$remove(function() {
					$location.path('steves');
				});
			}
		};

		// Update existing Steve
		$scope.update = function() {
			var steve = $scope.steve;

			steve.$update(function() {
				$location.path('steves/' + steve._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Steves
		$scope.find = function() {
			$scope.steves = Steves.query();
		};

		// Find existing Steve
		$scope.findOne = function() {
			$scope.steve = Steves.get({ 
				steveId: $stateParams.steveId
			});
		};
	}
]);
'use strict';

//Steves service used to communicate Steves REST endpoints
angular.module('steves').factory('Steves', ['$resource',
	function($resource) {
		return $resource('steves/:steveId', { steveId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);
'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
	function($httpProvider) {
		// Set the httpProvider "not authorized" interceptor
		$httpProvider.interceptors.push(['$q', '$location', 'Authentication',
			function($q, $location, Authentication) {
				return {
					responseError: function(rejection) {
						switch (rejection.status) {
							case 401:
								// Deauthenticate the global user
								Authentication.user = null;

								// Redirect to signin page
								$location.path('signin');
								break;
							case 403:
								// Add unauthorized behaviour 
								break;
						}

						return $q.reject(rejection);
					}
				};
			}
		]);
	}
]);
'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
	function($stateProvider) {
		// Users state routing
		$stateProvider.
		state('profile', {
			url: '/settings/profile',
			templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
		}).
		state('password', {
			url: '/settings/password',
			templateUrl: 'modules/users/views/settings/change-password.client.view.html'
		}).
		state('accounts', {
			url: '/settings/accounts',
			templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
		}).
		state('signup', {
			url: '/signup',
			templateUrl: 'modules/users/views/authentication/signup.client.view.html'
		}).
		state('signin', {
			url: '/signin',
			templateUrl: 'modules/users/views/authentication/signin.client.view.html'
		}).
		state('forgot', {
			url: '/password/forgot',
			templateUrl: 'modules/users/views/password/forgot-password.client.view.html'
		}).
		state('reset-invlaid', {
			url: '/password/reset/invalid',
			templateUrl: 'modules/users/views/password/reset-password-invalid.client.view.html'
		}).
		state('reset-success', {
			url: '/password/reset/success',
			templateUrl: 'modules/users/views/password/reset-password-success.client.view.html'
		}).
		state('reset', {
			url: '/password/reset/:token',
			templateUrl: 'modules/users/views/password/reset-password.client.view.html'
		});
	}
]);
'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		// If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signup = function() {
			$http.post('/auth/signup', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				// If successful we assign the response to the global user model
				$scope.authentication.user = response;

				// And redirect to the index page
				$location.path('/');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication',
	function($scope, $stateParams, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		// Submit forgotten password account id
		$scope.askForPasswordReset = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/forgot', $scope.credentials).success(function(response) {
				// Show user success message and clear form
				$scope.credentials = null;
				$scope.success = response.message;

			}).error(function(response) {
				// Show user error message and clear form
				$scope.credentials = null;
				$scope.error = response.message;
			});
		};

		// Change user password
		$scope.resetUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.passwordDetails = null;

				// Attach user profile
				Authentication.user = response;

				// And redirect to the index page
				$location.path('/password/reset/success');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);
'use strict';

angular.module('users').controller('SettingsController', ['$scope', '$http', '$location', 'Users', 'Authentication',
	function($scope, $http, $location, Users, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		// Check if there are additional accounts 
		$scope.hasConnectedAdditionalSocialAccounts = function(provider) {
			for (var i in $scope.user.additionalProvidersData) {
				return true;
			}

			return false;
		};

		// Check if provider is already in use with current user
		$scope.isConnectedSocialAccount = function(provider) {
			return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
		};

		// Remove a user social account
		$scope.removeUserSocialAccount = function(provider) {
			$scope.success = $scope.error = null;

			$http.delete('/users/accounts', {
				params: {
					provider: provider
				}
			}).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.user = Authentication.user = response;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Update a user profile
		$scope.updateUserProfile = function(isValid) {
			if (isValid){
				$scope.success = $scope.error = null;
				var user = new Users($scope.user);
	
				user.$update(function(response) {
					$scope.success = true;
					Authentication.user = response;
				}, function(response) {
					$scope.error = response.data.message;
				});
			} else {
				$scope.submitted = true;
			}
		};

		// Change user password
		$scope.changeUserPassword = function() {
			$scope.success = $scope.error = null;

			$http.post('/users/password', $scope.passwordDetails).success(function(response) {
				// If successful show success message and clear form
				$scope.success = true;
				$scope.passwordDetails = null;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', [

	function() {
		var _this = this;

		_this._data = {
			user: window.user
		};

		return _this._data;
	}
]);
'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
	function($resource) {
		return $resource('users', {}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);