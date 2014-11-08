var settings = require('../settings');
var utility = require('./utility');
var User = require('../models/user');

function setSessionLogin(req, user) {
    req.session.user = {
        isLogin: true,
        name: user.name,
    };
};

exports.showLogin = function(req, res) {
    if (req.session.user.isLogin) res.redirect('/');
    var info = utility.prepareRenderMessage(req);
    info.form = req.body.form || {};
    info.title = "Login";
    res.render('user_login', info);
};

exports.execLogin = function(req, res) {
    if (req.session.user.isLogin) res.redirect('/');
    res.locals.message = res.locals.message || [];
    var name = req.body.name;
    var password = settings.hashPassword(req.body.password);
    var fallback = function(errors) {
        errors.forEach(function(err) {
            res.locals.message.push(err);
        });
        var info = utility.prepareRenderMessage(req);
        info.form = req.body;
        info.title = "Login";
        return res.render('user_login', info);
    }

    User.findOne({name: name}, function(err, found) {
        if (err || !found || found.password != password)
            return fallback(['Invaild Username or Password']);
        setSessionLogin(req, found);
        res.redirect('/');
    });
};

exports.showRegister = function(req, res) {
    if (req.session.user.isLogin) res.redirect('/');
    var info = utility.prepareRenderMessage(req);
    info.form = req.body.form || {};
    info.title = "Register";
    res.render('user_register', info);
};

exports.execRegister = function(req, res) {
    if (req.session.user.isLogin) res.redirect('/');
    res.locals.message = res.locals.message || [];
    var fallback = function(errors) {
        errors.forEach(function(err) {
            res.locals.message.push(err);
        });
        var info = utility.prepareRenderMessage(req);
        info.form = req.body;
        info.title = "Register";
        return res.render('user_register', info);
    }
    if (!req.body.password)
        return fallback(['Password cannot be empty']);

    var info = {
        name: req.body.name,
        password: settings.hashPassword(req.body.password),
    };
    var item = new User(info);
    item.save(function(err) {
        if (err) return fallback(['Username used']);
        setSessionLogin(req, info);
        res.redirect('/');
    })
};

exports.execLogout = function(req, res) {
    req.session.destroy(function() {
        res.redirect('/'); 
    });
}
