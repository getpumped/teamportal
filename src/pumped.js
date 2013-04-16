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
    users.findAndModify({ _id: o_id}, [['_id','asc']], { $set: values }, { new: true }, function(err, result) {
      callback(err, result);
    })
  },
  deleteUser: function(id, callback) {
    var users = mongoClient.collection('users');
    users.remove({ _id: id }, function(err, numberOfRemovedDocs) {
      callback(err, numberOfRemovedDocs);
    })
  },
  getUser: function(id, callback) {
    var users = mongoClient.collection('users');
    var o_id = new BSON.ObjectID(id);
    users.findOne({ _id: o_id}, function(err, user) {
      if(err) {
        callback('The was an error retrieving user details, please try again.', null);
      } else if(user === null) {
        callback('We couldn\'t find you user details, please logout and try again', null);
      } else {
        callback(null, user);
      }
    });
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
    if(id != null && 'number' != typeof id && (id.length != 12 && id.length != 24)) {
      var o_id = id
    } else var o_id = new BSON.ObjectID(id);
    teams.findAndModify({ _id: o_id}, [['_id','asc']], { $set: values }, { new: true }, function(err, result) {
      callback(err, result);
    })
  },
  getTeam: function(teamid, callback) {
    var teams = mongoClient.collection('teams');
    teams.findOne({ _id: teamid }, function(err, team) {
      if(err) {
        callback('The was an error retrieving team details, please try again.', null);
      } else if(team === null) {
        callback('We couldn\'t find the team details, this team may not exist or you may have an incorrect address', null);
      } else {
        callback(null, team);
      }
    });
  },
  saveLog: function(log, callback) {
    var teamlogs = mongoClient.collection('teamlogs');
    teamlogs.save(log, function (err, log) {
        callback(err, log);
    });
  },
  removeLog: function(log, callback) {
    var teamlogs = mongoClient.collection('teamlogs');
    teamlogs.remove(log, function (err) {
        callback(err);
    });
  },
  getUserLogs: function(username, options, callback) {
    var teamlogs = mongoClient.collection('teamlogs');
    teamlogs.find({ username: username }, options).toArray(function (err, logs) {
        callback(err, logs);
    });
  },
  getTeamLogs: function(teamname, options, callback) {
    var teamlogs = mongoClient.collection('teamlogs');
    teamlogs.find({ teamname: teamname }, options).toArray(function (err, logs) {
        callback(err, logs);
    });
  },
  getLeaderboard: function(callback) {
    var leaderboard = mongoClient.collection('leaderboard');
    leaderboard.find({}, {limit: 10, sort: {value:-1}}).toArray(function(err, results) {
      callback(err, results);
    });
  },
  getTeamLeaderboard: function(teamname, callback) {
    var teamleaderboard = mongoClient.collection('teamleaderboard');
    teamleaderboard.find({ "_id.teamname": teamname }, {limit: 10, sort: {value:-1}}).toArray(function(err, results) {
      callback(err, results);
    });
  },
  getCommittedLeaderboard: function(callback) {
    var committedleaderboard = mongoClient.collection('committedleaderboard');
    committedleaderboard.find({}, {limit: 10, sort: {value:-1}}).toArray(function(err, results) {
      callback(err, results);
    });
  },
  getIronmanLeaderboard: function(callback) {
    var ironmanleaderboard = mongoClient.collection('ironmanleaderboard');
    ironmanleaderboard.find({}, {limit: 10, sort: {value:-1}}).toArray(function(err, results) {
      callback(err, results);
    });
  }
}