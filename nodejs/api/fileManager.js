var fs = require("fs");

var deleteFolder = module.exports.deleteFolder = function(path) {
//function deleteFolder( path ){
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolder(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};


var deleteServerFile = module.exports.deleteServerFile = function(){
	var dir = process.cwd() + "/public/file";
    deleteFolder( dir );
    fs.mkdirSync( dir );

    dir = process.cwd() + "/public/file2";
    deleteFolder( dir );
    fs.mkdirSync( dir );

    dir = process.cwd() + "/public/download";
    deleteFolder( dir );
    fs.mkdirSync( dir );

    dir = process.cwd() + "/public/video";
    deleteFolder( dir );
    fs.mkdirSync( dir );
};