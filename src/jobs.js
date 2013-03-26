var async = require('async'),
    stats = require('./stats');
module.exports = {
  teamUpdates: function(callback) {
    
  },
  buildStats: function(callback) {
    async.series([
        stats.buildLeaderboard,
        stats.buildTeamLeaderboard,
        stats.buildCommittedLeaderboard,
        stats.buildIronmanLeaderboard
    ],
    // optional callback
    function(err, results){
        if(err) {
          //Need to log the error here
        }
        if(callback) callback(err);
    });
  }
}