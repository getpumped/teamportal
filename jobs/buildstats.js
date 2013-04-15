var jobs = require('../src/jobs'), 
    config = require('../config'), 
    mongodb = require('mongodb'), 
    fs = require('fs'), 
    stats = require('../src/stats'),
    async = require('async');
module.exports = {
  setup: function(callback) {
    var joblogs = mongoClient.collection('joblogs');
    joblogs.findOne({ jobname: 'buildstats' }, function(err, job) {
      if(!job) {
        job = { jobname: 'buildstats', status: 'idle', lastrundate: new Date(), nextrundate: new Date() };
        joblogs.save(job, function() {
          callback(err);
        });
      } else callback(null)
    });
  },
  run: function(callback) {
    console.log('*********************');
    console.log(new Date());
    console.log('Build leaderboards started');
    var joblogs = mongoClient.collection('joblogs');
    joblogs.findAndModify({ jobname: 'buildstats', status: 'idle', nextrundate: { $lt: new Date() }}, [['_id', 1]], { $set:{status: 'running' }}, {new:true}, function(err, job) {
      console.log(job);
      if(job !== null && job.nextrundate < new Date()) {
        buildStats(function(err) {
          if(err) {
            console.log('Build leaderboards completed with errors');
          } else {
            console.log('Build leaderboards completed');
          }
          job.lastrundate = new Date();
          job.nextrundate = addMinutes(job.lastrundate, config.jobSchedules.buildstats);
          job.status = 'idle';
          joblogs.save(job, function() {
            if(err) {
              console.log('Error setting next run date for buildstats');
              console.log(err);
            }
            console.log(new Date());
            console.log('*********************');
            callback();
          })
        });
      } else {
        console.log('Not time to run job');
        console.log(new Date());
        console.log('*********************');
        callback()
      }
    });
  }
}


function addMinutes(date, milliseconds) {
  return new Date(date.getTime() + milliseconds);
}

function buildStats(callback) {
  async.series([
    stats.buildLeaderboard,
    stats.buildTeamLeaderboard,
    stats.buildCommittedLeaderboard,
    stats.buildIronmanLeaderboard
  ], function(err, results){
    if(err) {
      //Need to log the error here
    }
    if(callback) callback(err);
  });
}
