var moment = require('moment');
var settings = require('../settings');
var utility = require('./utility');
var User = require('../models/user');
var AI = require('../models/ai');
var UserRating = require('../models/userrating');

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
    item.save(function(err, saved) {
        if (err) return fallback(['Username used']);
        setSessionLogin(req, info);
        var rating = new UserRating({id: saved._id});
        rating.save(function(err, s) {
            res.redirect('/');
        })
    })
};

exports.execLogout = function(req, res) {
    req.session.destroy(function() {
        res.redirect('/'); 
    });
}

exports.showList = function(req, res) {
    User.count({}, function(err, count) {
        var page = Number(req.query.page || '1');
        var skip = settings.AIPerPage * (page-1);
        var sort = req.query.sort || '-rating';

        User.find({}).sort(sort).skip(skip).limit(settings.AIPerPage).exec(function(err, doc) {
            var info =utility.prepareRenderMessage(req);
            info.page = page;
            info.totpage = Math.ceil(count / settings.AIPerPage);
            info.sort = sort;

            info.title = 'User List';
            info.list = doc;
            return res.render('user_list', info);
        });
    });
}

exports.getRatingJSON = function(req, res) {
    var name = req.param('name');
    User.findOne({name: name}, function(err, userdoc) {
        if (err || !userdoc) {
            res.send('404 Not Found!');
            return;
        }
        UserRating.find({id: userdoc._id}).select({date:1, rating:1}).sort({_id:1}).exec(function(err, doc) {
            result = { x: 'Date', xFormat: '%m-%d %H:%M', columns: [['Date'], ['Rating']] };
            for (var i = 0; i < doc.length; ++i) {
                var rating = doc[i].rating;
                var date = moment(doc[i].date).format('MM-DD HH:mm');
                result.columns[0].push(date);
                result.columns[1].push(rating);
            }
            res.json(result);
        })
    });
}

