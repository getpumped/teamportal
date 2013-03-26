var jobs = require('../src/jobs')
  , config = require('../config')
  , mongodb = require('mongodb')
  , fs = require('fs');
console.log('*********************');
console.log(new Date());
console.log('Build leaderboards started');
new mongodb.Db('pumped', config.dbconnection, { w: 1, keepAlive: 1 }).open(function (err, client) {
	if(err) console.log(err);
  mongoClient = client;
  mongoClient.authenticate(config.dbUser, config.dbPass, {authdb: "admin"}, function(err, res) {
    var joblogs = mongoClient.collection('joblogs');
    joblogs.findOne({ jobname: 'buildstats' }, function(err, job) {
      if(!job || job.nextrundate < new Date()) {
        if(!job) job = { jobname: 'buildstats', lastrundate: new Date(), nextrundate: null };
        jobs.buildStats(function(err) {
          if(err) {
            console.log('Build leaderboards completed with errors');
          } else {
            console.log('Build leaderboards completed');
          }
          job.lastrundate = new Date();
          job.nextrundate = addMinutes(new Date(), config.jobSchedules.buildstats);
          joblogs.save(job, function() {
            if(err) {
              console.log('Error setting next run date for buildstats');
              console.log(err);
            }
            fs.writeFileSync(config.statDateFile, new Date());
            console.log(new Date());
            console.log('*********************');
            process.exit();
          })
        });
      } else {
        console.log('Not time to run job');
        console.log(new Date());
        console.log('*********************');
        process.exit();
      }
    });
  });
});

function addMinutes(date, milliseconds) {
    return new Date(date.getTime() + milliseconds);
}
    