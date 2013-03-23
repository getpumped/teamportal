var pumped = require('./pumped'),
    security = require('../security'),
    check = require('validator').check,
    dateFormat = require('dateformat'),
    routes = require('./routes'),
    ejs = require('ejs'),
    mailer = require('./mailer'),
    config = require('../config'),
    crypto = require('crypto'),
    fs = require('fs');

exports.teamUpdate = function(req, res) {
  if(req.session.user.teamname === null) {
    res.redirect('/private/choose-team');
    } else {
    pumped.getUserLogs(req.session.user.username, { limit: 10, skip: 0, sort: 'date' },
      function(err, logs) {
        if(err) {
          console.log(err);
          req.flash('errors', 'There was an error retrieving activity logs');
        }
        pumped.getLeaderboard(function(err, leaderboard) {
          if(err) {
            console.log(err);
            req.flash('errors', 'There was an error retrieving leaderboard');
          }
          pumped.getTeamLeaderboard(req.session.user, function(err, teamLeaderboard) {
            console.log(teamLeaderboard);
            if(err) {
              console.log(err);
              req.flash('errors', 'There was an error retrieving team leaderboard');
            }
            var merge_vars = { "MC_SUBJECT": "Get PUMPED! " + req.session.user.teamname + " Update",
                              "MC_TEAM_LINK": escape(config.appProtocol + '://' + config.appDNS + '/team/' + req.session.user.teamId),
                              "MC_TEAM_NAME": req.session.user.teamname, "MC_USER_NAME": req.session.user.username,
                              "unsubscribeUrl": escape(config.appProtocol + '://' + config.appDNS + '/teamupdates/unsubscribe?uid' + req.session.user._id), 
                              "profileUrl": escape(config.appProtocol + '://' + config.appDNS + '/private/account') }
            var file = 'views/emails/team-update.ejs';
            fs.readFile(file, 'utf8', function(err, template) {
            var html = ejs.render(template, { filename: file,compileDebug: true, title: 'Team Update', logs: logs
              , defaultDate: dateFormat(new Date(), "dd/mm/yyyy"), dateFormater: dateFormat,
              errors: req.flash('errors'), messages: req.flash('messages'), merge_vars: merge_vars,
              leaderboard: leaderboard, teamLeaderboard: teamLeaderboard});
              var params = { "message": { "html": html,"subject": "Team Update",
                "from_email": config.emailFrom, "from_name": config.emailFromName,
                "to": [{"email": req.session.user.email,"name": req.session.user.username}],
                "track_opens": true,  "track_clicks": true,"auto_text": true,"auto_html": false,
                "inline_css": true,"url_strip_qs": true,"preserve_recipients": false,
                "bcc_address": config.bccEmail,"tags": ["Team Updates"] },"async": true }
                if(err) res.send(err)
                else {
                  /*mailer.mandrill.call('messages', 'send', params, function (error, data) {
                      if (error)
                          res.send(error.message);
                      else
                          res.send(JSON.stringify(data)); // Do something with your data!
                  });*/
                  res.send(html);
                }
              });
           });
        });
      });
  }
};
exports.memberWelcome = function(req, res) {
  var merge_vars = { "MC_SUBJECT": "Get PUMPED! " + req.session.user.teamname + " Update",
                    "MC_TEAM_LINK": escape(config.appProtocol + '://' + config.appDNS + '/team/' + req.session.user.teamId),
                    "MC_TEAM_NAME": req.session.user.teamname, "MC_USER_NAME": req.session.user.username,
                    "unsubscribeUrl": escape(config.appProtocol + '://' + config.appDNS + '/teamupdates/unsubscribe?uid' + req.session.user._id), 
                    "profileUrl": escape(config.appProtocol + '://' + config.appDNS + '/private/account'),
                    "portalUrl": escape(config.appProtocol + '://' + config.appDNS + '/')};
  var file = 'views/emails/member-welcome.ejs';
  fs.readFile(file, 'utf8', function(err, template) {
    var html = ejs.render(template, { filename: file,compileDebug: true, title: 'Team Update', 
                                     defaultDate: dateFormat(new Date(), "dd/mm/yyyy"), dateFormater: dateFormat,
                                     errors: [], messages: [], merge_vars: merge_vars});
    var params = { "message": { "html": html,"subject": "Team Update",
                               "from_email": config.emailFrom, "from_name": config.emailFromName,
                               "to": [{"email": req.session.user.email,"name": req.session.user.username}],
                               "track_opens": true,  "track_clicks": true,"auto_text": true,"auto_html": false,
                               "inline_css": true,"url_strip_qs": true,"preserve_recipients": false,
                               "bcc_address": config.bccEmail,"tags": ["Member Welcome"] },"async": true }
      res.send(html);
      /*mailer.mandrill.call('messages', 'send', params, function (error, data) {
                      if (error)
                          res.send(error.message);
                      else
                          res.send(JSON.stringify(data)); // Do something with your data!
                  });*/
  });
}