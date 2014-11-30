var settings = require('../settings');

exports.initSession = function(req) {
    if (req.session.setup) return false;
    req.session.setup = true;
    req.session.user = {
        name: '',
        isLogin: false,
    };
    return true;
};

exports.prepareRenderMessage = function(req) {
    return {
        settings: settings,
        user: req.session.user
    };
};

exports.generateRandomString = function() {
    var chars = 'abcdefghijklmnopqrstuvwxyz1234567890';
    var str = '';
    for (var i = 0; i < 16; ++i) {
        var idx = (Math.random() * (chars.length - 1)).toFixed(0);
        str += chars[idx];
    }
    return str;
};
