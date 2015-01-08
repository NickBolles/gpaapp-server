var mode        = process.env.NODE_ENV || 'development',
    config      = require('../../config/config.js')[mode],
    defaultTerm = config.defaultTerm,
    mongoose    = require('mongoose'),
    User        = mongoose.model('User'),
    GpaappData  = mongoose.model('GpaappData');

module.exports.controller = require('./controller');
module.exports.router = require('./router');
