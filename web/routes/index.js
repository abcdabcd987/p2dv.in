var ai = require('./ai');
var user = require('./user');
var utility = require('./utility');

function showIndex(req, res) {
    var info = utility.prepareRenderMessage(req);
    res.render('index', info);
};

exports.setup = function(app) {
	app.get('/', showIndex);

	app.get ('/user/login', user.showLogin);
	app.post('/user/login', user.execLogin);
	app.get ('/user/register', user.showRegister);
	app.post('/user/register', user.execRegister);
	app.get ('/user/logout', user.execLogout);

    app.get ('/ai/upload', ai.showUpload);
    app.post('/ai/upload', ai.execUpload);
    app.get ('/ai/:id', ai.showStatus);
}