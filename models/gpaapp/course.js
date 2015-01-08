var mongoose     = require('mongoose'),
    moment       = require('moment'),
    Schema       = mongoose.Schema,
    Assign       = require('./assign'),
    math         = require('../../modules/libs/Math.uuid');

var courseSchema = new Schema({
        created:{ type:Number, default: moment.utc().unix()},
        modified: {type: Number, default: moment.utc().unix()},
        //Add a match for the uuid
        courseId:{type:String, required: true, default:math.uuid() },
        courseName:{type:String, lowercase: true, required: true, trim: true},
        instructor: {type:String},
        credits: {type: Number, min: 0, required:true},
        tPts: {type:Number,min: 0},
        sPts: {type:Number,min: 0},
        completed: {type: Boolean, default:false},
        notes:{type:String, trim:true},
        tags:[
            String
        ],
        assigns: [Assign.schema]
    },
    {
        strict:'throw'
    }
);
module.exports = mongoose.model('Course', courseSchema);