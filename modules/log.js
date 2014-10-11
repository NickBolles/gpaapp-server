exports.sectionStart = function (from, vars){
    console.log('===================' + from + '===================');
    var string = '';
    for(var i=0;i<vars.length;i++){
        string += JSON.stringify(vars[i]) + ' ' ;
    };
    console.log(string);
    console.log('-----------------------------------------------------');
}