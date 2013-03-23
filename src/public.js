var pumped = require('./pumped'),
    check = require('validator').check,
    sanitize = require('validator').sanitize,
    dateFormat = require('dateformat'),
    mongodb = require('mongodb'),
    BSON = mongodb.BSONPure,
    security = require('../security'),
    mailer = require('./mailer');

module.exports = {
  index: function(req, res) {
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
  },
  stats: function(req, res) {
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
  },
  createAccount: function(req, res) {
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
                              teamname: null, plannedmileage: null, newsletters: true, teamupdates: true }, function (err, user) {
                                mailer.subscribeUser(user, function(err) {
                                  if(err) {
                                    pumped.deleteUser(user._id, function(err, noRemoved) {
                                      req.flash('messages', 'There was an error creating your account');
                                      res.redirect('back');
                                    });
                                  } else {
                                    user.isAuthenticated = true;
                                    req.session.user = user;
                                    req.flash('messages', 'You\'re account has been created. Create or join a team to get started!');
                                    res.redirect('/private');
                                  }
                                })
                              });
           }
         });
       }
     });
  },
  teamupdateUnsubscribe: function(req, res) {
    if(!req.body.uid) {
      req.flash('errors', 'No user could be found matching the details passed.'); //Need to output these errors to the screen for the user
      return res.redirect('/private/account');
    }
    pumped.updateUser(req.session.user._id, { teamupdates: false }, function (err, user) {
                                if(err) req.flash('messages', 'There was an error updating your account');
                                else {
                                  req.flash('messages', 'Team updates subscription updated. You will no longer receive team update emails.' +
                                           ' To opt back in, sign-in and go to your profile where you can select the team updates box');
                                }
                                res.redirect('/');
    });
  },
  doLogin: function(req, res){
    try {
      check(req.body.email, 'Invalid email entered').is(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    } catch (e) {
      req.flash('errors', e.message); //Need to output these errors to the screen for the user
      return res.redirect('/login');
    }
    security.authenticate(req.body.email, function (err, user) {
      if (err) {
        req.flash('errors', 'You are not registered to use this application'); //Need to output these errors to the screen for the user
        return res.redirect('/login');
      } else {
        req.session.user = user;
        if(user.teamname === null) {
          res.redirect('/private/choose-team');
        } else {
          res.redirect('/private');
        }
      }
    });
  },
}