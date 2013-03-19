var locals = require('../locals'),
    pumped = require('./pumped'),
    security = require('../security'),
    check = require('validator').check,
    dateFormat = require('dateformat'),
    routes = require('./routes');

exports.index = function(req, res) {
  pumped.getLeaderboard(function(err, leaderboard) {
          console.log(leaderboard);
          if(err) {
            req.flash('errors', 'There was an error retrieving leaderboard');
          }
          pumped.getIronmanLeaderboard(function(err, ironmanLeaderboard) {
            console.log(ironmanLeaderboard);
            if(err) {
              req.flash('errors', 'There was an error retrieving ironman leaderboard');
            }
            pumped.getCommittedLeaderboard(function(err, commitmentLeaderboard) {
              console.log(commitmentLeaderboard);
              if(err) {
                req.flash('errors', 'There was an error retrieving commitment leaderboard');
              }
              res.render('index', { title: 'Home', 
                errors: req.flash('errors'), messages: req.flash('messages'),
                leaderboard: leaderboard, ironmanLeaderboard: ironmanLeaderboard, commitmentLeaderboard: commitmentLeaderboard});
           });
        });
    });
};

exports.stats = function(req, res) {
  pumped.getLeaderboard(function(err, leaderboard) {
          console.log(leaderboard);
          if(err) {
            req.flash('errors', 'There was an error retrieving leaderboard');
          }
          pumped.getIronmanLeaderboard(function(err, ironmanLeaderboard) {
            console.log(ironmanLeaderboard);
            if(err) {
              req.flash('errors', 'There was an error retrieving ironman leaderboard');
            }
            pumped.getCommittedLeaderboard(function(err, commitmentLeaderboard) {
              console.log(commitmentLeaderboard);
              if(err) {
                req.flash('errors', 'There was an error retrieving commitment leaderboard');
              }
              res.render('stats', { title: 'Race Stats', 
                errors: req.flash('errors'), messages: req.flash('messages'),
                leaderboard: leaderboard, ironmanLeaderboard: ironmanLeaderboard, commitmentLeaderboard: commitmentLeaderboard});
           });
        });
    });
};

exports.about = function(req, res) {
  res.render('about', { title: 'About', errors: req.flash('errors'), messages: req.flash('messages') });
};

exports.register = function(req, res) {
  res.render('register', { title: 'Register', errors: req.flash('errors'), messages: req.flash('messages') });
};

exports.private = function(req, res) {
  if(req.session.user.teamname === null) {
    res.redirect('/private/choose-team');
  } else {
    pumped.getUserLogs(req.session.user.username, { limit: 10, skip: 0, sort: 'date' },
      function(err, logs) {
        if(err) {
          req.flash('errors', 'There was an error retrieving activity logs');
        }
        pumped.getLeaderboard(function(err, leaderboard) {
          console.log(leaderboard);
          if(err) {
            req.flash('errors', 'There was an error retrieving leaderboard');
          }
          pumped.getTeamLeaderboard(function(err, teamLeaderboard) {
            console.log(teamLeaderboard);
            if(err) {
              req.flash('errors', 'There was an error retrieving team leaderboard');
            }
            res.render('./private/private', { title: 'Team Member Area', logs: logs
            , defaultDate: dateFormat(new Date(), "dd/mm/yyyy"), 
              errors: req.flash('errors'), messages: req.flash('messages'),
              leaderboard: leaderboard, teamLeaderboard: teamLeaderboard});
           });
        });
      });
  }
};

exports.addLog = function(req, res) {
  var dateparts = req.body.date.split('/');
  var date =  [dateparts[1], dateparts[0], dateparts[2]].join('/');
  try {
    console.log(date);
    check(date, 'Invalid date entered').isDate();
    check(req.body.logtype, 'Invalid activity type entered').notNull().notEmpty();
    check(req.body.mileage, 'Invalid mileage entered').isInt().min(1);
  } catch (e) {
    req.flash('errors', e.message); //Need to output these errors to the screen for the user
    return res.redirect('/private');
  }
  pumped.saveLog({ date: date, logtype: req.body.logtype, mileage: parseInt(req.body.mileage),
                  teamname: req.session.user.teamname, username: req.session.user.username },
                function(err, result) {
                  if(err) {
                    req.flash('errors', err);
                    res.redirect('/private');
                  } else {
                    req.flash('messages', 'Your activity was logged, race stats will be updated shortly'); 
                    res.redirect('/private');
                  }
                });
};

exports.createAccount = function(req, res) {
  try {
    check(req.body.username, 'Invalid username entered').is(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/)
    check(req.body.email, 'Invalid email entered').is(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  } catch (e) {
    req.flash('errors', e.message); //Need to output these errors to the screen for the user
    return res.redirect('/register');
  }
   pumped.checkUsernameNotTaken(req.body.username, function(err, user) {
     if(err) {
       req.flash('errors', err);
       res.redirect('/register');
     } else {
       pumped.checkUserNotExists({ email: req.body.email}, function(err, user) {
         if(err) {
           req.flash('errors', err);
           res.redirect('/register');
         } else {
           pumped.saveUser({ username: req.body.username, email: req.body.email, 
                            teamname: null, plannedmileage: null }, function (err, user) {
                              user.isAuthenticated = true;
                              req.session.user = user;
                              req.flash('messages', 'You\'re account has been created. You should receive an email shortly');
                              res.redirect('/private');
                            });
         }
       });
     }
   });
};
  

exports.doLogin = function(req, res){
  try {
    check(req.body.email, 'Invalid email entered').is(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  } catch (e) {
    req.flash('errors', e.message); //Need to output these errors to the screen for the user
    return res.redirect('/login');
  }
  security.authenticate(req.body.email, function (err, user) {
		if (err) { console.log(err); res.render('login', { errors: req.flash('errors'), messages: req.flash('messages') }); }
		else {
			req.session.user = user;
      if(user.teamname === null) {
      	res.redirect('/private/choose-team');
      } else {
      	res.redirect('/private');
      }
		}
	});
};

exports.login = function(req, res) {
  res.render('login', { title: 'Sign In', errors: req.flash('errors'), messages: req.flash('messages') });
};

exports.logout = function(req, res) {
  delete req.session.user;
  req.flash('messages','You\'ve been logged out');
  res.redirect('/');
};

exports.chooseTeam = function(req, res) {
  res.render('./private/team-choose', { title: 'Team Selection', errors: req.flash('errors'), messages: req.flash('messages') });
};

exports.createTeam = function(req, res) {
  res.render('./private/create-team', { title: 'Create a Team', errors: req.flash('errors'), messages: req.flash('messages') });
};

exports.doCreateTeam = function(req, res) {
  console.log(req.session.user._id);
  try {
    check(req.body.teamname, 'Invalid teamname entered').is(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/)
    check(req.body.teampassword, 'Invalid password entered').is(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/);
    check(req.body.plannedmileage, 'Invalid value entered for planned mileage').isInt(); 
  } catch (e) {
    req.flash('errors', e.message); //Need to output these errors to the screen for the user
    return res.redirect('/private/create-team');
  }
  pumped.checkTeamNotExists({ teamname: req.body.teamname }, function(err, user) {
    if(err) {
      req.flash('errors', err);
      res.redirect('/private/create-team');
    } else {
      pumped.saveTeam({ teamname: req.body.teamname, teampassword: req.body.teampassword
                  , teamlead: req.session.user.username }, function (err, team) {
          if(err) {
            console.log(err);
            req.flash('errors', 'The was an error completing you team registration.');
            res.redirect('/private/create-team');
          } else {
            pumped.updateUser(req.session.user._id, { plannedmileage: req.body.plannedmileage
                          , teamname: req.body.teamname }, function(err, user) {
                            req.session.user.plannedmileage = req.body.plannedmileage;
                            req.session.user.teamname = req.body.teamname;
                            req.flash('messages', 'Your team has been created');    
                            res.redirect('/private');
                          });

          }
      });
    }
  });
};

exports.joinTeam = function(req, res) {
  res.render('./private/join-team', { title: 'Join a Team', errors: req.flash('errors'), messages: req.flash('messages') });
};

exports.doJoinTeam = function(req, res) {
  try {
    check(req.body.teamname, 'Invalid teamname entered').is(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/)
    check(req.body.teampassword, 'Invalid password entered').is(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/);
    check(req.body.plannedmileage, 'Invalid value entered for planned mileage').isInt(); 
  } catch (e) {
    req.flash('errors', e.message); //Need to output these errors to the screen for the user
    return res.redirect('/private/join-team');
  }
  if(req.session.user.teamname !== null) {
    req.flash('errors', 'Your already a member of a team (' + req.session.user.teamname + ').');
    res.redirect('/private/join-team');
  } else {
    pumped.checkTeamExists({ teamname: req.body.teamname }, function(err, team) {
      if(err) {
        req.flash('errors', err);
        res.redirect('/private/join-team');
      } else {
        console.log(team.teampassword, req.body.teampassword)
        if(team.teampassword !== req.body.teampassword) {
          req.flash('errors', 'The password enter was incorrect'); //Need to output these errors to the screen for the user
          res.redirect('/private/join-team');
        } else {
          pumped.updateUser(req.session.user._id, { plannedmileage: req.body.plannedmileage
                           , teamname: req.body.teamname }, function(err, user) {
                             req.session.user.teamname = req.body.teamname;
                             req.flash('messages', 'Your team has been created');    
                             res.redirect('/private');
                           });
    
        }
      }
    });
  }
};