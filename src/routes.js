var public = require('./public'),
    private = require('./private');

exports.index = function(req, res) {
  public.index(req, res);
};

exports.stats = function(req, res) {
  public.stats(req, res);
};

exports.statsEmb = function(req, res) {
  public.statsEmb(req, res);
};

exports.about = function(req, res) {
  res.render('about', { title: 'About', errors: req.flash('errors'), messages: req.flash('messages') });
};

exports.register = function(req, res) {
  res.render('register', { title: 'Register', errors: req.flash('errors'), messages: req.flash('messages') });
};

exports.private = function(req, res) {
  private.index(req, res);
};

exports.addLog = function(req, res) {
  private.addLog(req, res);
};

exports.createAccount = function(req, res) {
  public.createAccount(req, res);
};

exports.account = function(req, res) {
  private.account(req, res);
}

exports.accountUpdate = function(req, res) {
  private.accountUpdate(req, res);
}

exports.teamupdateUnsubscribe = function(req, res) {
  public.teamupdateUnsubscribe(req, res);
}
  
exports.doLogin = function(req, res){
  public.doLogin(req, res);
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
  private.doCreateTeam(req, res);
};

exports.joinTeam = function(req, res) {
  res.render('./private/join-team', { title: 'Join a Team', errors: req.flash('errors'), messages: req.flash('messages') });
};

exports.doJoinTeam = function(req, res) {
  private.doJoinTeam(req, res);
};

exports.team = function(req, res) {
  public.team(req, res);
}

exports.admin = function(req, res) {
  private.admin(req, res);
}

exports.runjob = function(req, res) {
  private.runjob(req, res);
}