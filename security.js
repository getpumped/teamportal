var crypto = require('crypto');
var options = {};

module.exports = {
	middleware: function (opt) {
		if (opt) options = opt;

		return function (req, res, callback) {
			if (req.session.user === undefined) {
				req.session.user = { isAuthenticated: false, username: 'Guest', is_admin: false }
			}
			res.locals.user = req.session.user;
			callback();
		}
	},
	authenticate: function (username, callback) {
		var sessionUser = null;
		console.log('Authenticating user');
		var users = mongoClient.collection('users');
    users.findOne({ email: username }, function (err, user) {
			if (err) { console.log(err); return callback(err, null) }
			if (!user) return callback('You are not a valid user');
			else {
				user.isAuthenticated = true;
				return callback(null, user);
			}
		});
	}
}