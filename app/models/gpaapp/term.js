var mongoose    = require('mongoose'),
    Schema      = mongoose.Schema,
    Course      = require('./course'),
    moment      = require('moment'),
    math        = require('./../../libs/Math.uuid');

var termTypeEnum = {
    values: 'Semester Trimester Quarter Other'.split(' '),
    message: "'{VALUE}' is not a valid term type"
};
var termSchema = new Schema({
        modified: {type: Number, default: moment.utc().unix()},
        created:{ type:Number, default: moment.utc().unix()},
        //Add a match for the uuid
        termId:{type:String, required: true, default: math.uuid()},
        termName:{type:String, lowercase: true, required: true, trim: true},
        termType: {type:String, required: true, enum: termTypeEnum},
        termSDate: {type: Number, default: moment.utc().unix()},
        termEDate: {type: Number, default: moment.utc().add(4,'months').unix()},
        completed: {type: Boolean, default:false},
        notes:{type:String, trim:true},
        tags:[
            String
        ],
        courses: [Course.schema]
    },
    {
        strict:'throw'
    }
);
termSchema.mvalidate = function(testValue){
    console.log("termSchema.validate()");
    var model = mongoose.model('t',termSchema,null,true)
    new model(testValue).validate(function(err){
        if (err){
            console.log(err);
            return err;
        }
    });
};
module.exports = mongoose.model('Term', termSchema);