var mode        = process.env.NODE_ENV || 'development',
    config      = require('../../config/config.js')[mode],
    defaultTerm = config.defaultTerm,
    mongoose    = require('mongoose'),
    User        = mongoose.model('User'),
    GpaappData  = mongoose.model('GpaappData');


var Controller = {};
Controller.deleteUserData = function(req,res){
    if (testing){responseBegin('DELETE: /gpabot/userdata');}
    console.log('req.body is ' + req.body);
    //console.log('req.body is ' + JSON.stringify(req.body));
    //DM.deleteItem(req.cookies.email, req.body , function(e, userData){
    //    if (e){
    //        console.log(e);
    //        res.status(400).json({'message': e});
    //        if (testing){responseComplete('Post: /gpabot/userdata  ERROR');}
    //
    //    }else{
    //        console.log('DATA SYNCED userData is ' + userData);
    //        userData = utils.toStr(userData);
    //        var response = {message: 'ok', data: userData};
    //        res.status(200).json( response );
    //        if (testing){responseComplete('Post: /gpabot/userdata  Success');}
    //    }
    //});
    User.findOne({email:req.user.email}, function(err, user){
        if (err) {
            return res.status(400).json({message:"Error: Unable to find specified User"});
        }else{
            user.data.gpaapp = [];
            user.data.gpaapp[0] = new GpaappData({terms:[defaultTerm]});
            return res.status(200).json({message:ok, data: user.data.gpaapp[0]})
        }
    })
};




module.exports = Controller;