'use strict';

(function() {
	// Ranks Controller Spec
	describe('Ranks Controller Tests', function() {
		// Initialize global variables
		var RanksController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Ranks controller.
			RanksController = $controller('RanksController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Rank object fetched from XHR', inject(function(Ranks) {
			// Create sample Rank using the Ranks service
			var sampleRank = new Ranks({
				name: 'New Rank'
			});

			// Create a sample Ranks array that includes the new Rank
			var sampleRanks = [sampleRank];

			// Set GET response
			$httpBackend.expectGET('ranks').respond(sampleRanks);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.ranks).toEqualData(sampleRanks);
		}));

		it('$scope.findOne() should create an array with one Rank object fetched from XHR using a rankId URL parameter', inject(function(Ranks) {
			// Define a sample Rank object
			var sampleRank = new Ranks({
				name: 'New Rank'
			});

			// Set the URL parameter
			$stateParams.rankId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/ranks\/([0-9a-fA-F]{24})$/).respond(sampleRank);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.rank).toEqualData(sampleRank);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Ranks) {
			// Create a sample Rank object
			var sampleRankPostData = new Ranks({
				name: 'New Rank'
			});

			// Create a sample Rank response
			var sampleRankResponse = new Ranks({
				_id: '525cf20451979dea2c000001',
				name: 'New Rank'
			});

			// Fixture mock form input values
			scope.name = 'New Rank';

			// Set POST response
			$httpBackend.expectPOST('ranks', sampleRankPostData).respond(sampleRankResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Rank was created
			expect($location.path()).toBe('/ranks/' + sampleRankResponse._id);
		}));

		it('$scope.update() should update a valid Rank', inject(function(Ranks) {
			// Define a sample Rank put data
			var sampleRankPutData = new Ranks({
				_id: '525cf20451979dea2c000001',
				name: 'New Rank'
			});

			// Mock Rank in scope
			scope.rank = sampleRankPutData;

			// Set PUT response
			$httpBackend.expectPUT(/ranks\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/ranks/' + sampleRankPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid rankId and remove the Rank from the scope', inject(function(Ranks) {
			// Create new Rank object
			var sampleRank = new Ranks({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Ranks array and include the Rank
			scope.ranks = [sampleRank];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/ranks\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleRank);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.ranks.length).toBe(0);
		}));
	});
}());