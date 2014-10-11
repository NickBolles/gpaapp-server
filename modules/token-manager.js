
var mysql      = require('mysql');
var crypto     = require('crypto');
var moment     = require('moment');
var dbConf     = require('../config/database.js');
var log     = require('./log.js');
var connection = mysql.createConnection(dbConf);
var sql;

var testing = true;

connection.connect(function(err) {
  if (err) throw err;
  console.log('Token-manager connected as id ' + connection.threadId);
  console.log('connected to database :: ' + dbConf.database);
  console.log('=============================================');
});

exports.validate = function(req, res, callback){
    var email = req.cookies.email;
    var token = req.cookies.token;    
    
    if(testing){log.sectionStart('VALIDATETOKEN', ['Recieved Token', token, 'recieved email', email, 'Request URL', req.url]);}
    
    if (email && token){
        //sql = mysql.format("SELECT token FROM users WHERE email = ? LIMIT 1", email);
        sql = "SELECT token FROM users WHERE email = \'" + email + "\' LIMIT 1"; 
        if (testing){
            console.log(sql);
        }

        connection.query(sql, function(err, results){
                if (testing){
                    console.log('sql statement completed');
                    console.log('Result is: ' + JSON.stringify(results));
                }
                if(err){
                    console.log(err);
                }else{//The SQL Statement Completed Successfully
                    if (results[0]){
                        if (results[0].token === token){
                            createAndSave(email, function(e, newToken){
                                if (e){
                                    if(testing){console.log('Error createing and saving new token')};
                                    callback('Error createing and saving new token');
                                }
                                else{
                                    if (testing){console.log('Token Valid! New Token Saved.');}
                                    res.cookie('token', newToken, {path: '/', httpOnly:true});
                                    res.cookie('email', email, {path: '/', httpOnly:true});
                                    callback(null, res, newToken);
                                }
                            });
                            
                        }else{
                            if (testing){console.log('Token Does not match stored Token');}
                            callback('Token Does not match stored Token');
                        }
                    }else{
                        if (testing){console.log('Invalid Email in session cookie');}
                        callback('Invalid Email In Session Cookie');
                    }
                }
        });
    }else{
        if (testing){console.log('Email or Token Undefined! Email: ' + email + ' token: ' + token);}
        callback('Email or Token Undefined! Please Login Again');
    }
};


//callback will be callback(error, newToken)
exports.createAndSave = function(email, callback){
    createAndSave(email,callback);
    
};

exports.create = function(email, callback){
    createToken(email, function(newToken){
        return newToken;
    });
    
};

var createAndSave = function(email,callback){
    createToken(email, function(newToken){
        saveToken(email,newToken, callback);
    });
}
var createToken = function(email, callback){
    var str = email + moment.utc();
    callback(crypto.createHash('sha256').update(str).digest('hex'));
    
    
};


var saveToken = function(email, newToken, callback){
    if (testing){log.sectionStart('saveToken', ['user email: ',  email, 'user token',  newToken]);}
	
    //actually add the user
    sql = 'UPDATE users SET token=\'' + newToken + '\' WHERE email=\'' + email + '\';'
    if (testing){
        console.log('executeing SQL statement: '  + sql);
    }        
    connection.query(sql, function(err,results){
        if (testing){
            console.log('sql statement completed');
        }
        if (err){
            console.log(err);
            callback('Error adding new Token to database. ERRORMESSAGE: ' + err);
        }
        else{
            callback(null, newToken);
        }
    });
};



				