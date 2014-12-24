'use strict';

(function() {
	// Scores Controller Spec
	describe('Scores Controller Tests', function() {
		// Initialize global variables
		var ScoresController,
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

			// Initialize the Scores controller.
			ScoresController = $controller('ScoresController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Score object fetched from XHR', inject(function(Scores) {
			// Create sample Score using the Scores service
			var sampleScore = new Scores({
				name: 'New Score'
			});

			// Create a sample Scores array that includes the new Score
			var sampleScores = [sampleScore];

			// Set GET response
			$httpBackend.expectGET('scores').respond(sampleScores);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.scores).toEqualData(sampleScores);
		}));

		it('$scope.findOne() should create an array with one Score object fetched from XHR using a scoreId URL parameter', inject(function(Scores) {
			// Define a sample Score object
			var sampleScore = new Scores({
				name: 'New Score'
			});

			// Set the URL parameter
			$stateParams.scoreId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/scores\/([0-9a-fA-F]{24})$/).respond(sampleScore);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.score).toEqualData(sampleScore);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Scores) {
			// Create a sample Score object
			var sampleScorePostData = new Scores({
				name: 'New Score'
			});

			// Create a sample Score response
			var sampleScoreResponse = new Scores({
				_id: '525cf20451979dea2c000001',
				name: 'New Score'
			});

			// Fixture mock form input values
			scope.name = 'New Score';

			// Set POST response
			$httpBackend.expectPOST('scores', sampleScorePostData).respond(sampleScoreResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Score was created
			expect($location.path()).toBe('/scores/' + sampleScoreResponse._id);
		}));

		it('$scope.update() should update a valid Score', inject(function(Scores) {
			// Define a sample Score put data
			var sampleScorePutData = new Scores({
				_id: '525cf20451979dea2c000001',
				name: 'New Score'
			});

			// Mock Score in scope
			scope.score = sampleScorePutData;

			// Set PUT response
			$httpBackend.expectPUT(/scores\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/scores/' + sampleScorePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid scoreId and remove the Score from the scope', inject(function(Scores) {
			// Create new Score object
			var sampleScore = new Scores({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Scores array and include the Score
			scope.scores = [sampleScore];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/scores\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleScore);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.scores.length).toBe(0);
		}));
	});
}());