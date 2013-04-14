var MailChimpAPI = require('mailchimp').MailChimpAPI,
    MandrillAPI = require('mailchimp').MandrillAPI,
    config = require('../config'),
    async = require('async'),
    dateFormat = require('dateformat'),
    mailChimpAPIKey = config.mailChimpAPIKey,
    mandrillAPIKey = config.mandrillAPIKey,
    mailChimp = null, 
    mandrill = null,
    ejs = require('ejs-locals'),
    fs = require('fs');
try { 
  mailChimp = new MailChimpAPI(mailChimpAPIKey, { version : '1.3', secure : false });
} catch (error) {
  console.log(error.message);
}
try { 
  mandrill = new MandrillAPI(mandrillAPIKey, { version : '1.0', secure: false });
} catch (error) {
  console.log(error.message);
}

mandrill.call('users', 'ping', { }, function (error, data) {
  if (error)
    console.log(error.message);
  else
    console.log(JSON.stringify(data)); // Do something with your data!
});
module.exports = { 
  mailChimp: mailChimp,
  mandrill: mandrill,
  subscribeUser: function(user, callback) {
    if(config.enableMailer) {
      mailChimp.listSubscribe({ id:'16aa587a7f', email_address:user.email
                               , merge_vars:{"FNAME":user.forename, "LNAME":user.surname}, email_type:'html'
                               , double_optin:false, send_welcome: false, update_existing: true }, function(error, data) {
                                 if (error) {
                                   console.log(error.message)
                                   callback(error.message);
                                 }
                                 else {
                                   console.log(data);
                                   callback(null);
                                 }
                               });
    } else callback(null);
  },
  sendMemberWelcome: function(user, callback) {
    if(config.enableMailer) {
      var merge_vars = { "MC_SUBJECT": "Get PUMPED! " + user.teamname + " Update",
                        "MC_TEAM_LINK": encodeURI(config.appProtocol + '://' + config.appDNS + '/team/' + user.teamId),
                        "MC_TEAM_NAME": user.teamname, "MC_USER_NAME": user.username,
                        "unsubscribeUrl": encodeURI(config.appProtocol + '://' + config.appDNS + '/teamupdates/unsubscribe?uid' + user._id), 
                        "profileUrl": encodeURI(config.appProtocol + '://' + config.appDNS + '/private/account'),
                        "portalUrl": encodeURI(config.appProtocol + '://' + config.appDNS + '/')};
      var options = { settings: {}, title: 'Team Pumped Registration', defaultDate: dateFormat(new Date(), "dd/mm/yyyy"), dateFormater: dateFormat,
                     errors: [], messages: [], merge_vars: merge_vars};
      var file = 'views/emails/member-welcome.ejs';
      var html = ejs('views/emails/member-welcome.ejs', options, function(err, html) {
        if(err) { console.log('got here'); callback(err) }
        else {
          var params = { "message": { "html": html,"subject": "Team Update",
                                     "from_email": config.emailFrom, "from_name": config.emailFromName,
                                     "to": [{"email": user.email,"name": user.username}],
                                     "track_opens": true,  "track_clicks": true,"auto_text": true,"auto_html": false,
                                     "inline_css": true,"url_strip_qs": true,"preserve_recipients": false,
                                     "bcc_address": config.bccEmail,"tags": ["Member Welcome"] },"async": true };
          
          mandrill.call('messages', 'send', params, function (error, data) {
            if (error)
              callback(error.message);
            else
              callback(null);
          });
        }
      });
      
    } else callback(null);
  },
  sendTeamUpdates: function(users, teamname, callback) {
    if(config.enableMailer) {
      pumped.getLeaderboard(function(err, leaderboard) {
        if(err) {
          return callback(err);
        }
        pumped.getTeamLeaderboard(teamname, function(err, teamLeaderboard) {
          console.log(teamLeaderboard);
          if(err) {
            return callback(err);
          }
          async.each(users, sendTeamUpdate, function(err){
            callback(err);
          });
        });
      });
    } else callback(null);
  },
  sendNewTeamMemberNotice: function(user, callback) {
    
  }
}

function sendTeamUpdate(user, global_vars, callback) {
  var merge_vars = { "MC_SUBJECT": "Get PUMPED! " + user.teamname + " Update",
                    "MC_TEAM_LINK": encodeURI(config.appProtocol + '://' + config.appDNS + '/team/' + user.teamId),
                    "MC_TEAM_NAME": user.teamname, "MC_USER_NAME": user.username,
                    "unsubscribeUrl": encodeURI(config.appProtocol + config.appDNS + '/teamupdates/unsubscribe?uid' + user.user._id), 
                    "profileUrl": encodeURI(config.appProtocol + config.appDNS + '/private/account') }
  var options = { settings: {}, title: 'Team Update', logs: logs, defaultDate: dateFormat(new Date(), "dd/mm/yyyy"), dateFormater: dateFormat,
                 errors: [], messages: [], merge_vars: merge_vars,leaderboard: global_vars.leaderboard, 
                 teamLeaderboard: global_vars.teamLeaderboard }
  ejs('./emails/team-update', options,function(err, html) {
    if(err) callback(err)
    else {
    var params = { "message": { "html": html,"subject": "Team Update",
                               "from_email": config.emailFrom, "from_name": config.emailFromName,
                               "to": [{"email": user.email,"name": user.username}],
                               "track_opens": true,  "track_clicks": true,"auto_text": true,"auto_html": false,
                               "inline_css": true,"url_strip_qs": true,"preserve_recipients": false,
                               "bcc_address": config.bccEmail,"tracking_domain": "example tracking_domain",
                               "tags": ["Team Updates"] },"async": true }

      mandrill.call('messages', 'send', params, function (error, data) {
        if (error)
          callback(error.message);
        else
          callback(JSON.stringify(data)); // Do something with your data!
      });
    }
  });
}