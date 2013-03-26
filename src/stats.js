module.exports = {
  buildLeaderboard: function(callback) {
    var teamlogs = mongoClient.collection('teamlogs');
     // Map function
    var map = function() { emit({ teamname:this.teamname, teamid:this.teamid }, this.mileage); };
    // Reduce function
      var reduce = function(k, v){
        printjson(v);
          count = 0;
          for(i = 0; i < v.length; i++) {
              count += parseFloat(v[i]);
          }
          return count;
      }

    teamlogs.mapReduce(map, reduce, {out: {replace : 'tempCollection'}}, function(err, collection) {
      collection.rename('leaderboard', {dropTarget:true}, function(err, reply) {
        callback(err); 
      });
    });
  },
  buildTeamLeaderboard: function(callback) {
    var teamlogs = mongoClient.collection('teamlogs');
    // Map function
    var map = function() { emit({ username:this.username, userid:this.userid, teamname:this.teamname, teamid: this.teamid }, this.mileage); };
    // Reduce function
    var reduce = function(k, v){
      count = 0;
      for(i = 0; i < v.length; i++) {
        count += parseFloat(v[i]);
      }
      return count;
    }
    
    teamlogs.mapReduce(map, reduce, { out: {replace : 'tempCollection'}}, function(err, collection) {
      collection.rename('teamleaderboard', {dropTarget:true}, function(err, reply) {
        callback(err); 
      });
    });
  },
  buildCommittedLeaderboard: function(callback) {
    var teamlogs = mongoClient.collection('teamlogs');
     // Map function
    var map = function() { emit({ username:this.username, userid:this.userid, teamname:this.teamname, teamid: this.teamid }, 1); };
    // Reduce function
      var reduce = function(k, v){
          count = 0;
          for(i = 0; i < v.length; i++) {
              count += v[i];
          }
          return count;
      }
    
    // Execute map reduce and return results inline
    teamlogs.mapReduce(map, reduce, {out: {replace : 'tempCollection'}}, function(err, collection) {
      collection.rename('committedleaderboard', {dropTarget:true}, function(err, reply) {
        callback(err); 
      });
    });
  },
  buildIronmanLeaderboard: function(callback) {
    var teamlogs = mongoClient.collection('teamlogs');
     // Map function
    var map = function() { emit({ username:this.username, userid:this.userid, teamname:this.teamname, teamid: this.teamid }, this.mileage); };
    // Reduce function
    var reduce = function(k, v){
      max = 0;
      for(i = 0; i < v.length; i++) {
        if(max < parseFloat(v[i])) max = parseFloat(v[i]);
      }
      return max;
    }
    
    // Execute map reduce and return results inline
    teamlogs.mapReduce(map, reduce, { out: {replace : 'tempCollection'}}, function(err, collection) {
      collection.rename('ironmanleaderboard', {dropTarget:true}, function(err, reply) {
        callback(err); 
      });
    });
  }
}