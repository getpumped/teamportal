var pumped = require('./pumped'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    dateFormat = require('dateformat'),
    mongodb = require('mongodb'),
    BSON = mongodb.BSONPure,
    mailer = require('./mailer');

module.exports = {
  index: function(req, res) {
    if(req.session.user.teamname === null) {
      res.redirect('/private/choose-team');
    } else {
      pumped.getUserLogs(req.session.user.username, { limit: 10, skip: 0, sort: {'date': -1} },
        function(err, logs) {
          if(err) {
            req.flash('errors', 'There was an error retrieving activity logs');
          }
          pumped.getLeaderboard(function(err, leaderboard) {
            console.log(leaderboard);
            if(err) {
              req.flash('errors', 'There was an error retrieving leaderboard');
            }
            pumped.getTeamLeaderboard(req.session.user.teamname, function(err, teamLeaderboard) {
              console.log(teamLeaderboard);
              if(err) {
                req.flash('errors', 'There was an error retrieving team leaderboard');
              }
              res.render('./private/private', { title: 'Team Member Area', logs: logs
                , defaultDate: dateFormat(new Date(), "dd/mm/yyyy"), dateFormater: dateFormat,
                errors: req.flash('errors'), messages: req.flash('messages'),
                                               leaderboard: leaderboard, teamLeaderboard: teamLeaderboard, showShareButtons: true });
             });
          });
        });
    }
  },
  account: function(req, res) {
    pumped.getUser(req.session.user._id, function(err, user) {
      if(err) {
        req.flash('errors', err);
        return res.redirect('/');
      }
      pumped.getTeam(user.teamId, function(err, team) {
        if(err) {
          req.flash('errors', err);
          return res.redirect('/');
        }
        user.isAuthenticated = true;
        req.session.user = user;
        res.render('./private/account', { team: team, user: user, title: 'User Profile', errors: req.flash('errors'), messages: req.flash('messages') });
      });
    });
  },
  addLog: function(req, res) {
    var dateparts = req.body.date.split('/');
    var date =  [dateparts[1], dateparts[0], dateparts[2]].join('/');
    try {
      console.log(date);
      check(date, 'Invalid date entered').isDate();
      check(req.body.logtype, 'Invalid activity type entered').notNull().notEmpty();
      check(req.body.mileage, 'Invalid mileage entered. Must be a number greater than 0.1').isDecimal().min(0.1);
    } catch (e) {
      req.flash('errors', e.message); //Need to output these errors to the screen for the user
      return res.redirect('/private');
    }
    pumped.saveLog({ date: date, logtype: req.body.logtype, mileage: parseFloat(req.body.mileage),
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
  },
  accountUpdate: function(req, res) {
    try {
      check(req.body.plannedmileage, 'Invalid value entered for planned mileage').isInt(); 
      check(req.body.fundraisingtarget, 'Invalid value entered for fundraising target').isDecimal(); 
      check(req.body.fundraisingtotal, 'Invalid value entered for fundraising total').isDecimal(); 
      check(req.body.teamfundraisingpage, 'Invalid value entered for fundraising total').isUrl(); 
    } catch (e) {
      req.flash('errors', e.message); //Need to output these errors to the screen for the user
      return res.redirect('/private/account');
    }
    pumped.updateUser(req.session.user._id, { plannedmileage: parseInt(req.body.plannedmileage),
                       fundraisingtarget: parseFloat(req.body.fundraisingtarget),
                       fundraisingtotal: parseFloat(req.body.fundraisingtotal),
                       newsletters: sanitize(req.body.newsletters).toBooleanStrict(),
                       teamupdates: sanitize(req.body.teamupdates).toBooleanStrict() }, function (err, user) {
                                if(err) req.flash('messages', 'There was an error updating your account');
                                else {
                                  user.isAuthenticated = true;
                                  req.session.user = user;
                                  req.flash('messages', 'You\'re account has been updated.');
                                }
                         pumped.updateTeam(user.teamId, { teamfundraisingpage: req.body.teamfundraisingpage }, function(err, team) {
                           if(err) req.flash('messages', 'Updates to your team fundraising page may not have been made.');
                           res.redirect('/private/account');
                         });
                       });
  },
  doCreateTeam: function(req, res) {
    try {
      check(req.body.teamname, 'Invalid teamname entered').is(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/)
      check(req.body.teampassword, 'Invalid password entered').is(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/);
      check(req.body.plannedmileage, 'Invalid value entered for planned mileage').isInt(); 
      check(req.body.fundraisingtarget, 'Invalid value entered for fundraising target').isDecimal();
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
                              , teamname: team.teamname, teamId: team._id,
                                                       fundraisingtarget: req.body.fundraisingtarget, isteamlead: true }
                              , function(err, user) {
                                mailer.sendMemberWelcome(user, function(err) {
                                  user.isAuthenticated = true;
                                  req.session.user = user;
                                  req.flash('messages', 'Your team has been created'); 
                                  res.redirect('/private');
                                });
                            });
  
            }
        });
      }
    });
  },
  doJoinTeam: function(req, res) {
    try {
      check(req.body.teamname, 'Invalid teamname entered').is(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/)
      check(req.body.teampassword, 'Invalid password entered').is(/^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/);
      check(req.body.plannedmileage, 'Invalid value entered for planned mileage').isInt();
      check(req.body.fundraisingtarget, 'Invalid value entered for fundraising target').isDecimal(); 
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
                             , teamname: req.body.teamname, teamId: team._id,
                                fundraisingtarget: req.body.fundraisingtarget  }, function(err, user) {
                               mailer.sendMemberWelcome(user, function(err) {
                                  user.isAuthenticated = true;
                                  req.session.user = user;
                                  req.flash('messages', 'You\'ve joined ' + req.body.teamname);    
                                  res.redirect('/private');
                                });
                             });
      
          }
        }
      });
    }
  },
  admin: function(req, res) {
    res.render('./private/account', { title: 'Admin Area', errors: req.flash('errors'), messages: req.flash('messages') });
  }
}