var log     = require('./log.js');
var mysql      = require('mysql');
var dbConf     = require('../config/database.js')
var connection = mysql.createConnection(dbConf);
var moment     = require('moment');
var utils      = require('./utils.js');

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
                    console.log('results are: ' + results);
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
exports.syncUserData = function(email, rData, callback){
    var sql = mysql.format("SELECT data FROM user_data WHERE email = ? AND application = \'gpabot\' LIMIT 1", email);
    if (testing){console.log('executeing SQL statement: '  + sql);}
    connection.query(sql, function(err,results){
        var sData = JSON.parse(results[0].data);
        console.log('//////////////////////////////////////////////////////////////////////////////////////////////////////////');
        console.log('type of sdata is ' + typeof sData + 'Data is ' + results[0].data);
        console.log('//////////////////////////////////////////////////////////////////////////////////////////////////////////');
        if (testing){console.log('Sql statement completed');}
        if (err){
            console.log(err);
            callback('Error getting userData for ' + email + ' ERRORMESSAGE:' + err);
        }
        else{
//            console.log('Saved DATA: ' + sData);
//            console.log('recieved DATA: ' + JSON.stringify(rData));

            syncItem(rData, sData);
            exports.saveUserData(email, sData, function(e){
                if (e){
                    callback(e);
                }else{
                    callback(null, sData);
                }
            });

        }
    });
};
exports.saveUserData = function(email, data, callback){
    //if (testing){log.sectionStart('saveUserData', ['newData ', newData]);}
    var date = moment.utc();
    var dataString = utils.toStr(data);
    sql = 'UPDATE user_data SET data= \'' + dataString + '\' , lastchange= \'' + date + '\' WHERE email = \'' + email + '\'';
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
    newData.data = '{"terms": []}';
    sql = 'INSERT INTO user_data (email, uuid, data, lastchange, application, devices) VALUES ( \'' + newData.email + '\' , \'' + newData.uuid + '\' , \'' + newData.data + '\' , \'' + newData.date + '\' , \'' + newData.application + '\' , \' [' + newData.appId + ']\')';
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
exports.deleteItem = function(newData, callback){
    callback('This is not yet functionining!');
};
function syncItem(rItem, sItem ){
    for (r in rItem){
        var rCurProp = rItem[r];

        //a userData object
        if (r == "terms"){
            //check to see if the saved data has a terms slot, if not set the saved terms slot to the recieved terms slot
            if (sItem.terms.length) {
                //for (term in data.terms)
                for (term in rCurProp) {
                    console.log(' Syncing term ' + term);
                    var rCurTerm = rCurProp[term];
                    var found = false; // variable to determine whether this term existed in the saved data or not

                    //iterate through the passed in item in the same way and compare the uuid's
                    //if a uuid matches its the same term, compare the modified date
                    for (s in sItem.terms) {
                        var sCurTerm = sItem.terms[s];
                        if (rCurTerm.uuid === sCurTerm.uuid) {
                            console.log('CurrentTerm is ' + JSON.stringify(rCurTerm, undefined, 2));
                            console.log('Saved Term is ' + JSON.stringify(sCurTerm, undefined, 2));
                            found = true;
                            //This is a matching term, check to see if it has been modified
                            if (rCurTerm.dateModified > sCurTerm.dateModified) {
                                console.log('Current Term is newer then saved, updating saved to \r\n' + JSON.stringify(sCurTerm, undefined, 2));
                                //For now just set the sItem equal to the new value
                                //sItem[term] = rItem[term];

                                syncItem(rCurTerm, sCurTerm);
                            }
                        }
                    }

                    if (!found) {
                        sItem[term] = rItem[term];
                    }
                }
            }
            else{
                    sItem['terms'] = rItem['terms'];
            }
        }
        else if (r == "courses"){
            for (course in rCurProp){
                console.log(' Syncing course ' + course);
                var rCurCourse = rCurProp[course];

                //iterate through the passed in item in the same way and compare the uuid's
                //if a uuid matches its the same term, compare the modified date
                for (s in sItem.courses){
                    var sCurCourse = sItem.courses[s];
                    if (rCurCourse.uuid === sCurCourse.uuid){
                        //This is a matching term, check to see if it has been modified
                        if (rCurCourse.dateModified > sCurCourse.dateModified){
                            syncItem(rCurCourse, sCurCourse);
                        }
                    }
                }
            }
        }
        else if (r == "assigns"){
            for (assign in rCurProp){
                console.log(' Syncing assignment ' + assign);
                var rCurAssign = rCurProp[assign];

                //iterate through the passed in item in the same way and compare the uuid's
                //if a uuid matches its the same term, compare the modified date
                for (s in sItem.assigns){
                    var sCurAssign = sItem.assigns[s];
                    if (rCurAssign.uuid === sCurAssign.uuid){
                        //This is a matching term, check to see if it has been modified
                        if (rCurAssign.dateModified > sCurAssign.dateModified){
                            syncItem(rCurAssign, sCurAssign);
                        }
                    }
                }
            }
        }
        else{
            //set all items into the new data
            console.log(' Setting item  ' + r);
            sItem[r] = rItem[r];
        }
    }
}