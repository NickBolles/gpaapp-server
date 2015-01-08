var mongoose    = require('mongoose'),
    moment      = require('moment'),
    Schema      = mongoose.Schema,
    math        = require('./../../libs/Math.uuid');

var assignSchema = new Schema({
        created:{ type:Number, default: moment.utc().unix()},
        modified: {type: Number, default: moment.utc().unix()},
        //Add a match for the uuid
        assignId:{type:String, required: true, default:math.uuid()},
        assignName:{type:String, lowercase: true, required: true, trim: true},
        dueDate: {type: Number},
        tPts: {type:Number,min: 0},
        sPts: {type:Number,min: 0},
        weight: {type: Number, min: 0, max: 100},
        completed: {type:Boolean, default:false},
        notes:String,
        tags: [String]
    },
    {
        strict:'throw'
    }
);
module.exports = mongoose.model('Assign', assignSchema);