var ai = require('./ai');
var user = require('./user');
var battle = require('./battle');
var contest = require('./contest');
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
    app.get ('/user/:name/rating.json', user.getRatingJSON);

    app.get ('/ai/upload', ai.showUpload);
    app.post('/ai/upload', ai.execUpload);
    app.get ('/ai/list', ai.showList);
    app.get ('/ai/:id', ai.showStatus);
    app.get ('/ai/:id/rating.json', ai.getRatingJSON);

    app.get ('/battle/list', battle.showList);
    app.post('/battle/start', battle.execStart);
    app.get ('/battle/:id-steps.json', battle.getSteps);
    app.get ('/battle/:id.json', battle.getJSON);
    app.get ('/battle/:id/:text.log', battle.getText);
    app.get ('/battle/:id/rejudge', battle.execRejudge);
    app.get ('/battle/:id', battle.showDemo);

    app.get ('/contest/create', contest.showCreate);
    app.post('/contest/create', contest.execCreate);
    app.post('/contest/:id/add', contest.execAddAI);
    app.get ('/contest/:id/del/:ai', contest.execDelAI);
    app.post('/contest/:id/submit', contest.execSubmit);
    app.get ('/contest/:id/status.json', contest.getStatus);
    app.get ('/contest/:id', contest.showContest);
}