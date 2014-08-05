var log     = require('./log.js');
var token      = require('./token-manager.js');
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
  console.log('Account-manager connected as id ' + connection.threadId);
  console.log('connected to database :: ' + dbConf.database);
  console.log('=============================================');
});




exports.manualLogin = function(email, pass, callback){
    if (testing){log.sectionStart('manualLogin', ['Email: ', email, 'Password: ', pass]);}
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
                                        if (err){
                                                callback('Invalid Password. Please Try Again.');

                                        }	else{
                                            token.createAndSave(email, function(e,newToken){
                                                console.log('New Token is ' + newToken);
                                                callback(null, {newToken:newToken,email: email});
                                                
                                            });
                                                
                                                //This may need to be modified
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
    if (testing){log.sectionStart('addNewAccount', ['newData to be added: ', newData]);}
    
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
                                newData.token = token.create(newData.email);

                                if (testing){
                                    console.log('user creation date is: ' + newData.date);
                                }
                                //actually add the user
                                sql = 'INSERT INTO users (name, email, password, salt, creationdate, uuid, token) VALUES ( \'' + newData.name + '\' , \'' + newData.email + '\' , \'' + newData.pass + '\' , \'' +newData.salt + '\' , \'' + newData.date + '\' , \'' + newData.uuid + '\' , \'' + newData.token + '\' )';
                                if (testing){console.log('executeing SQL statement: '  + sql);}        
                                connection.query(sql, function(err,results){
                                    //results should be 0 rows
                                    if (testing){console.log('Sql statement completed');}
                                    if (err || results[0]){
                                        console.log(err);
                                        callback1('Error adding new user to database. ERRORMESSAGE: ' + err);
                                    }
                                    else{
                                        DM.createUserData(newData, function(e){
                                            if (e){
                                                callback1(e);
                                            }
                                            else{
                                                callback1(null);
                                            }
                                        });
                                        
                                    }
                                });
                        });
                } 
            }
        });
};

var saltAndHash = function(plainPass, callback)
{
	var salt = generateSalt();
	callback(salt, sha256(salt + plainPass));
};        
var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 32; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
};

var sha256 = function(str){
    return crypto.createHash('sha256').update(str).digest('hex');
};


var validatePassword = function(plainPass, hashedPass, salt, callback)
{
	
	var validHash = sha256(salt + plainPass);
        if (testing){log.sectionStart('validatePassword', ['Recieved Pass: ',  plainPass, '\r\nHashed Recieved Pass: ',  validHash, '\r\nHashedStoredPass: ', hashedPass, '\r\nAre They Equal? ', (hashedPass === validHash)]);}
        callback(null, hashedPass === validHash);
};

