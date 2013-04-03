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
    var leaderboard = mongoClient.collection('leaderboard');
    teamlogs.mapReduce(map, reduce, {out: {replace : 'tempCollection'}}, function(err, collection) {
      collection.find().each(function(err, item) {
        if(item != null) {
          leaderboard.update({ _id: item._id }, item, { upsert:true }, function(err, result) {
          
          });
        } else callback(err);
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
    var teamleaderboard = mongoClient.collection('teamleaderboard');
    teamlogs.mapReduce(map, reduce, { out: {replace : 'tempCollection'}}, function(err, collection) {
      collection.find().each(function(err, item) {
        if(item != null) {
          teamleaderboard.update({ _id: item._id }, item, { upsert:true }, function(err, result) {
          
          });
        } else callback(err);
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
    
    var committedleaderboard = mongoClient.collection('committedleaderboard');
    teamlogs.mapReduce(map, reduce, {out: {replace : 'tempCollection'}}, function(err, collection) {
      collection.find().each(function(err, item) {
        if(item != null) {
          committedleaderboard.update({ _id: item._id }, item, { upsert:true }, function(err, result) {
          
          });
        } else callback(err);
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
    
    var ironmanleaderboard = mongoClient.collection('ironmanleaderboard');
    teamlogs.mapReduce(map, reduce, { out: {replace : 'tempCollection'}}, function(err, collection) {
      collection.find().each(function(err, item) {
        if(item != null) {
          ironmanleaderboard.update({ _id: item._id }, item, { upsert:true }, function(err, result) {
          
          });
        } else callback(err);
      });
    });
  }
}