var log     = require('./log.js');
var mysql      = require('mysql');
var dbConf     = require('../config/database.js')
var connection = mysql.createConnection(dbConf);
var moment     = require('moment');


var testing = true;
/* establish the database connection */

connection.connect(function(err) {
  if (err){
      console.log(err);
      throw err;
  }
  console.log('Data-Manager connected as id ' + connection.threadId);
  console.log('connected to database :: ' + dbConf.database);
  console.log('=============================================');
});


/* login validation methods */

exports.getUserData = function(user, callback)
{
    if (testing){log.sectionStart('getUserData', ['User Object ', user]);}
    if (user.email){
        sql = mysql.format("SELECT data FROM user_data WHERE email = ? AND application = \'gpabot\' LIMIT 1", user.email);
    }
    else if(user.uuid){
        sql = mysql.format("SELECT data FROM user_data WHERE uuid = ? AND application = \'gpabot\' LIMIT 1", user.uuid);
    }
    else{
        sql = '';
    }
    if (sql){
        if (testing){
            //console.log(sql);
        }

        connection.query(sql, function(err, results){
                if (testing){
                    console.log('sql statement completed');
                    console.log('results are: ' + JSON.stringify(results));
                }
                if(err){
                    console.log(err);
                   callback(err);
                }else{
                    if (results[0]){
                        callback(null, results[0].data);
                    }
                    //The email is available
                    else{
        
                    }
                }
            });
        }
        
};
	
exports.saveUserData = function(email, data, callback){
    //if (testing){log.sectionStart('saveUserData', ['newData ', newData]);}
    var date = moment.utc();
    sql = 'UPDATE user_data SET data= \'' + JSON.stringify(data) + '\' , lastchange= \'' + date + '\' WHERE email = \'' + email + '\'';
    if (testing){console.log('executeing SQL statement: '  + sql);}        
    connection.query(sql, function(err,results){
        if (testing){console.log('Sql statement completed');}
        if (err){
            console.log(err);
            callback('Error updating user_data in database. ERRORMESSAGE: ' + err);
        }
        else{
            if (testing) {console.log('callback');}
            callback(null);
        }
    });
};
exports.createUserData = function(newData, callback){
    if (testing){log.sectionStart('createUserData', ['newData ', newData]);}
    newData.application = 'gpabot';
    newData.data = "{}";
    sql = 'INSERT INTO user_data (email, uuid, data, lastchange, application) VALUES ( \'' + newData.email + '\' , \'' + newData.uuid + '\' , \'' + newData.data + '\' , \'' + newData.date + '\' , \'' + newData.application + '\' )';
    if (testing){console.log('executeing SQL statement: '  + sql);}        
    connection.query(sql, function(err,results){
        if (testing){console.log('Sql statement completed');}
        if (err){
            console.log(err);
            callback('Error adding new user to database. ERRORMESSAGE: ' + err);
        }
        else{
            if (testing) {console.log('callback');}
            callback(null);
        }
        
    });
};