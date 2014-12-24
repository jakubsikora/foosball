'use strict';

module.exports = function(app) {
  var users = require('../../app/controllers/users');
  var ranks = require('../../app/controllers/ranks');

  // Ranks Routes
  app.route('/ranks')
    .get(ranks.list);
};