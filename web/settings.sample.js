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
    adminUsernames: [],
    defaultPort: 3000,
    secret: cookieSecret,
    staticCDN: '',
    //staticCDN: 'http://p2dv-in.qiniudn.com',
    frontSalt: 'Your Salt for Frontend Encryption, Random String',
    databaseInfo: dbi,
    uploadPath: '/Users/abcdabcd987/Developer/tmp/p2dv.in/upload/',
    textFilePath: '/Users/abcdabcd987/Developer/tmp/p2dv.in/log/',
    battlePerPage: 20,
    AIPerPage: 20,
    sessionDb: {
        secret: cookieSecret,
        store: new mongoStore(dbi)
    },
    hashPassword: function(password) {
        return crypto.createHash('sha512').update(password + "Your Salt for Password Storage, Random String").digest('hex');
    }
};

