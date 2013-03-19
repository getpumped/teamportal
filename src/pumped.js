var mongodb = require('mongodb'),
    underscore = require('underscore'),
    BSON = mongodb.BSONPure;

module.exports = {
  checkUserNotExists: function(user, callback) {
    var users = mongoClient.collection('users');
    users.findOne(user, function(err, user) {
      if(err) {
        callback('The was an error completing you user registration.', null);
      } else if(user !== null) {
        callback('The email address entered is already registered', user);
      } else {
        callback(null, user);
      }
    });
  },
  checkUsernameNotTaken: function(username, callback) {
    var users = mongoClient.collection('users');
    users.findOne({ username: username }, function(err, user) {
      if(err) {
        callback('The was an error completing you user registration.', null);
      } else if(user !== null) {
        callback('The username entered is already registered, please choose another.', user);
      } else {
        callback(null, user);
      }
    });
  },
  saveUser: function(user, callback) {
    var users = mongoClient.collection('users');
    users.save(user, function (err, user) {
        callback(err, user);
    });
  },
  updateUser: function(id, values, callback) {
    var users = mongoClient.collection('users');
    var o_id = new BSON.ObjectID(id);
    users.update({ _id: o_id}, { $set: values }, function(err, result) {
      callback(err);
    })
  },
  checkTeamExists: function(team, callback) {
    var teams = mongoClient.collection('teams');
    teams.findOne(team, function(err, team) {
      if(err) {
        callback('The was an error completing you team registration.', null);
      } else if(team === null) {
        callback('The team name entered is not registered', team);
      } else {
        callback(null, team);
      }
    });
  },
  checkTeamNotExists: function(team, callback) {
    var teams = mongoClient.collection('teams');
    teams.findOne(team, function(err, team) {
      if(err) {
        callback('The was an error completing you team registration.', null);
      } else if(team !== null) {
        callback('The team name entered is already registered', team);
      } else {
        callback(null, team);
      }
    });
  },
  saveTeam: function(team, callback) {
    var teams = mongoClient.collection('teams');
    teams.save(team, function (err, team) {
        callback(err, team);
    });
  },
  updateTeam: function(id, values, callback) {
    var teams = mongoClient.collection('teams');
    var o_id = new BSON.ObjectID(id);
    teams.update({ _id: o_id }, { $set: values }, function(err, result) {
      callback(err);
    })
  },
  saveLog: function(log, callback) {
    var teamlogs = mongoClient.collection('teamlogs');
    teamlogs.save(log, function (err, log) {
        callback(err, log);
    });
  },
  getUserLogs: function(username, options, callback) {
    var teamlogs = mongoClient.collection('teamlogs');
    teamlogs.find({ username: username }, options).toArray(function (err, logs) {
        callback(err, logs);
    });
  },
  getLeaderboard: function(callback) {
    var teamlogs = mongoClient.collection('teamlogs');
     // Map function
    var map = function() { emit(this.teamname, this.mileage); };
    // Reduce function
      var reduce = function(k, v){
        printjson(v);
          count = 0;
          for(i = 0; i < v.length; i++) {
              count += parseInt(v[i]);
          }
          return count;
      }
    
    // Execute map reduce and return results inline
    teamlogs.mapReduce(map, reduce, {out: {replace : 'tempCollection'}}, function(err, results) {
      if(results) {
        results.find().toArray(function(err, results) {
         callback(err, results.sort(function (a, b) {
              if (a.mileage < b.mileage) return 1;
              if (b.mileage < a.mileage) return -1;
              return 0;
          })); 
        });
      } else {
        callback(err, []);
      }
    });
  },
  getTeamLeaderboard: function(callback) {
    var teamlogs = mongoClient.collection('teamlogs');
     // Map function
    var map = function() { emit(this.username, this.mileage); };
    // Reduce function
      var reduce = function(k, v){
        printjson(v);
          count = 0;
          for(i = 0; i < v.length; i++) {
              count += parseInt(v[i]);
          }
          return count;
      }
    
    // Execute map reduce and return results inline
    teamlogs.mapReduce(map, reduce, {out: {replace : 'tempCollection'}}, function(err, results) {
      if(results) {
        results.find().toArray(function(err, results) {
         callback(err, results.sort(function (a, b) {
              if (a.mileage < b.mileage) return 1;
              if (b.mileage < a.mileage) return -1;
              return 0;
          })); 
        });
      } else {
        callback(err, []);
      }
    });
  },
  getCommittedLeaderboard: function(callback) {
    var teamlogs = mongoClient.collection('teamlogs');
     // Map function
    var map = function() { emit(this.username, 1); };
    // Reduce function
      var reduce = function(k, v){
        printjson(v);
          count = 0;
          for(i = 0; i < v.length; i++) {
              count += v[i];
          }
          return count;
      }
    
    // Execute map reduce and return results inline
    teamlogs.mapReduce(map, reduce, {out: {replace : 'tempCollection'}}, function(err, results) {
      if(results) {
        results.find().toArray(function(err, results) {
         callback(err, results.sort(function (a, b) {
              if (a.mileage < b.mileage) return 1;
              if (b.mileage < a.mileage) return -1;
              return 0;
          })); 
        });
      } else {
        callback(err, []);
      }
    });
  },
  getIronmanLeaderboard: function(callback) {
    var teamlogs = mongoClient.collection('teamlogs');
    teamlogs.find({}, { limit: 10, sort: {'mileage': -1}}).toArray(function (err, results) {  
      if(results) callback(err, results);
      else callback(err,[]);
    });
  }
}