
/**
 * Module dependencies.
 */

var config = require('./config')
  , express = require('express')
  , routes = require('./src/routes')
  , http = require('http')
  , path = require('path')
  , security = require('./security')
  , mongodb = require('mongodb')
  , MongoStore = require('connect-mongo')(express)
  , helpers = require('./locals')
  , flash = require('connect-flash');

app = express();
new mongodb.Db('pumped', config.dbconnection, { w: 1, keepAlive: 1 }).open(function (err, client) {
	if(err) console.log(err);
  mongoClient = client;
  mongoClient.authenticate(config.dbUser, config.dbPass, {authdb: "admin"}, function(err, res) {
  app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.engine('ejs', require('ejs-locals'));
    app.use(express.favicon(__dirname + '/public/img/favicon.png'));
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('Pumped Team Portal'));
		app.use(express.session({secret: 'Pumped Team Portal Session', cookie: { maxAge: 604800000 }, store: new MongoStore({db:mongoClient})}));
		app.use(flash());
    app.use(security.middleware());
    app.use(app.router);
    app.use(require('stylus').middleware(__dirname + '/public'));
    app.use(express.static(path.join(__dirname, 'public')));
  });

  app.configure('development', function(){
    app.use(express.errorHandler());
  });
  
  /* Important :: Must be declare first. DO NOT PUT ROUTES ABOVE THIS LINE */
  app.all('/private*', authoriseRoute);
  
  /* Add routes below */
  app.get('/', routes.index);
  app.post('/register', routes.createAccount);
  app.get('/register', routes.register);
  app.post('/login', routes.doLogin);
  app.get('/login', routes.login);
  app.get('/logout', routes.logout);
  app.get('/private/create-team', routes.createTeam);
  app.post('/private/create-team', routes.doCreateTeam);
  app.get('/private/join-team', routes.joinTeam);
  app.post('/private/join-team', routes.doJoinTeam);
  app.get('/private', routes.private);
  app.get('/private/choose-team', routes.chooseTeam);
  app.post('/private/add-log', routes.addLog);
  app.get('/stats', routes.stats);
  
  //app.get('/users', user.list);
  
  app.locals.helpers = helpers;
  http.createServer(app).listen(config.port, config.ipaddr, function() {
    console.log("Express server listening on port " + config.port);
  });
  });
});

authoriseRoute = function (req, res, callback) {
	var user = req.session.user;
	if (!user.isAuthenticated) {
		req.session.fwd = req.originalUrl;
		return res.redirect('/login')
	}
	else callback();
}
