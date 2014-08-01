var mysql      = require('mysql');
var crypto     = require('crypto');
var moment     = require('moment');
var dbConf     = require('../config/database.js');
var DM         = require('./data-manager')
var connection = mysql.createConnection(dbConf);
var sql;

var testing = true;
//var newData = {user: 'nick_bolles', email: "test@eample.com", pass:'testpassword', uuid: '92329D39-6F5C-4520-ABFC-AAB64544E172'};

/*function callback(e){
    if (testing){
        console.log('CallBack for addnewUser');
    }
    if (e){
        console.log('error in adding new user' + e);
    }
    
}*/

/* establish the database connection */

connection.connect(function(err) {
  if (err) throw err;
  console.log('connected as id ' + connection.threadId);
  console.log('connected to database :: ' + dbConf.database);
  console.log('=============================================');
});

email = 'test@eample.com';

    
exports.autoLogin = function(token, callback)
{
    sql = mysql.format("SELECT * FROM users WHERE token = ? LIMIT 1", token);

    if (testing){
        console.log(sql);
    }
    connection.query(sql, function(err, user){
        user = user[0];
        if (testing){
            console.log('sql statement completed');
        }
        if(err){
            if (testing){
                console.log('ERROR!!!!!: ' + err);
            }
            callback(null);
        }else{
            //The SQL statement completed successfully
            //There is a token present
            if (testing){
                console.log(JSON.stringify(user));
                console.log(user.password + '    ' + pass);
            }
            //create a new token, add it to the user object and save the token, then return user
            user.token = createToken(user.email);
            saveToken(user, function(){
               return user; 
            });
            
        }
    });
    
}

exports.manualLogin = function(email, pass, callback){
    sql = mysql.format("SELECT * FROM users WHERE email = ? LIMIT 1", email);

    if (testing){
        console.log(sql);
    }
    connection.query(sql, function(err, user){
        
        if (testing){
            console.log('sql statement completed');
        }
        if(err){
            if (testing){
                console.log(err);
            }
            callback(err);
        }else{
            //Check to see if a user was found
            
            if (user[0]){
                user = user[0];
                //The SQL statement completed successfully
                //now we need to check to see if the password matches
                if (testing){
                    console.log('Username Found results are:')
                    console.log(JSON.stringify(user));
                    console.log(user.password + '    ' + pass);
                }
                validatePassword(pass, user.password, user.salt, function(err, res) {
                                        if (res){
                                                user.token = createToken(email);
                                                saveToken(user, callback);
                                                //This may need to be modified

                                        }	else{
                                                callback('Invalid Password. Please Try Again.');
                                        }
                                });
            }else{
                //No user was found
                callback('Invalid Email. Please Try Again.')
            }              
            

        }
    });
}

    
exports.addNewAccount = function(newData, callback1){
    sql = mysql.format("SELECT id FROM users WHERE email = ? LIMIT 1", newData.email);

    if (testing){
        console.log(sql);
    }

    connection.query(sql, function(err, results){
            if (testing){
                console.log('sql statement completed');
            }
            if(err){
                console.log(err);
            }else{
                if (results[0]){
                    callback1('This email is allready registered. Did you forget your password?');
                }
                //The email is available
                else{
                    saltAndHash(newData.pass, function(salt, hash){
                                if (testing){
                                    console.log('Password before hash is: ' + newData.pass);
                                    console.log('salt is ' + salt);
                                    console.log('Password after hash is: ' + hash);
                                }
                                newData.pass = hash;
                                newData.salt = salt;
                        // append date stamp when user was created //
                                newData.date = moment.utc();
                                newData.token = createToken(newData.email);

                                if (testing){
                                    console.log('user creation date is: ' + newData.date);
                                }
                                //actually add the user
                                sql = 'INSERT INTO users (name, email, password, salt, creationdate, uuid, token) VALUES ( \'' + newData.name + '\' , \'' + newData.email + '\' , \'' + newData.pass + '\' , \'' +newData.salt + '\' , \'' + newData.date + '\' , \'' + newData.uuid + '\' , \'' + newData.token + '\' )';
                                if (testing){console.log('executeing SQL statement: '  + sql);}        
                                connection.query(sql, function(err,results){
                                    if (testing){console.log('Sql statement completed');}
                                    if (err){
                                        console.log(err);
                                        callback1('Error adding new user to database. ERRORMESSAGE: ' + err);
                                    }
                                    else{
                                        DM.createUserData(newData, callback1);
                                        
                                    }
                                });
                        });
                } 
            }
        });
};
exports.validateToken = function(token, email, callback){
    sql = mysql.format("SELECT token FROM users WHERE email = ? LIMIT 1", email);

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
                        var newToken = createToken(email);
                        saveToken({newToken: token, email:email}, function(e,o){
                            callback(true, newToken);
                        })
                        
                    }else{
                        callback(false);
                    }
                }
            }
    });
};
var saltAndHash = function(plainPass, callback)
{
	var salt = generateSalt();
	callback(salt, sha256(salt + plainPass));
}        
var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 32; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var sha256 = function(str){
    return crypto.createHash('sha256').update(str).digest('hex');
}


var validatePassword = function(plainPass, hashedPass, salt, callback)
{
	var validHash = sha256(salt + plainPass);
        if (testing){ console.log('======================================================\r\nRecieved Pass: ' + plainPass + '\r\nHashed Recieved Pass: ' + validHash + '\r\nHashedStoredPass: ' + hashedPass + '\r\nAre They Equal? ' + (hashedPass === validHash) + '\r\n======================================================' );}
	callback(null, hashedPass === validHash);
}

var createToken = function(email){
    var str = email + moment.utc();
    return crypto.createHash('sha256').update(str).digest('hex');
    
    
}

var saveToken = function(user, callback){
    //actually add the user
    sql = 'UPDATE users SET token=\'' + user.token + '\' WHERE email=\'' + user.email + '\';'
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
            callback(null, user);
        }
    });
}
