var jobs = require('../src/jobs'), 
    config = require('../config'), 
    mongodb = require('mongodb'), 
    fs = require('fs'), 
    stats = require('../src/stats'),
    async = require('async');
module.exports = {
  setup: function(callback) {
    app.locals.statrefreshdate = 'never';
    callback(null);
  },
  run: function(callback) {
    var joblogs = mongoClient.collection('joblogs');
    joblogs.findOne({ jobname: 'buildstats' }, function(err, job) {
      if(!job) app.locals.statrefreshdate = 'never';
      else app.locals.statrefreshdate = job.lastrundate;
      callback(null);
    });
  }
}