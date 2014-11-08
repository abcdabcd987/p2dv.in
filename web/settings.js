var crypto = require('crypto');
var path = require('path');
var express = require('express');
var mongoStore = require('connect-mongo')(express);

var dbi = {
    db: 'p2dvin'
};
var cookieSecret = "Your Cookie Secret, Random String";
module.exports = {
    websiteName: 'p2dv.in',
    defaultPort: 3000,
    secret: cookieSecret,
    frontSalt: 'Your Salt for Frontend Encryption, Random String',
    databaseInfo: dbi,
    uploadPath: '/Users/abcdabcd987/Developer/tmp/p2dv.in/upload/',
    sessionDb: {
        secret: cookieSecret,
        store: new mongoStore(dbi)
    },
    hashPassword: function(password) {
        return crypto.createHash('sha512').update(password + "Your Salt for Password Storage, Random String").digest('hex');
    }
};

