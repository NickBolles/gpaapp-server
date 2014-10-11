exports.toStr = function(input){
    if (input !== 'undefined') {
        var output;
        if (typeof input !== 'string') {
            //input is not a string, check to see if its an object, if it is stringify it
            if (typeof input == 'object') {

                output = JSON.stringify(input);
                return output;
            } else {
                console.log('UserData is not an object');
                //input is not an object, log an error and return nothing
                return;
            }
        } else {
            return input;
        }
    }
}
exports.toObj = function(input){
    if (input != 'undefined'){
        var output;
        if (typeof input !== 'object'){
            //input is not an object, check to see if its a string, if it is parse it
            if (typeof input == 'string'){
                output = JSON.parse(input);
                return output;
            }else{
                //input is not a string, log an error and return
                return;
            }
        }else{
            //input is allready an object, return it
            return input;
        }
    }
}