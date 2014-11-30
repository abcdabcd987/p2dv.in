var ai = require('./ai');
var user = require('./user');
var battle = require('./battle');
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
    app.get ('/user/list', user.showList);

    app.get ('/ai/upload', ai.showUpload);
    app.post('/ai/upload', ai.execUpload);
    app.get ('/ai/list', ai.showList);
    app.get ('/ai/:id', ai.showStatus);

    app.get ('/battle/list', battle.showList);
    app.post('/battle/start', battle.execStart);
    app.get ('/battle/:id-steps.json', battle.getSteps);
    app.get ('/battle/:id.json', battle.getJSON);
    app.get ('/battle/:id', battle.showDemo);
}