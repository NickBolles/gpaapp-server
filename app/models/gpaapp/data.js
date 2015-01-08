var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Term = require('./term');
var moment     = require('moment');

var gpaappDataSchema = new Schema({
        created:{ type:Number, default: moment.utc().unix()},
        modified: {type: Number, default: moment.utc().unix()},
        notes:{type:String, trim:true},
        terms:[Term.schema]
    },
    {
        strict:'throw'
    }
);
module.exports = mongoose.model('GpaappData', gpaappDataSchema);