var buildstats = require('../jobs/buildstats'),
    getlaststatrefresh = require('../jobs/getlaststatrefresh');
module.exports = {
  setup: function(callback) {
    buildstats.setup(function(err) {
      var cronJob = require('cron').CronJob;
      var job = new cronJob('1 * * * * *', function(){
        buildstats.run(function(err) {
          if(err) console.log(err);
        })
      }, function () {
        // This function is executed when the job stops
        console.log('job stopped');
      },true,'UTC');
    });
    getlaststatrefresh.setup(function(err) {
      var cronJob = require('cron').CronJob;
      var job = new cronJob('1 * * * * *', function(){
        getlaststatrefresh.run(function(err) {
          if(err) console.log(err);
        })
      }, function () {
        // This function is executed when the job stops
        console.log('job stopped');
      },true,'UTC');
    });
  }
}