var querystring = require("querystring"), 
    url = require("url"), 
    fs = require("fs"),    
    formidable = require("formidable"); 
    
    
function upload(req,res){ 
    var form = new formidable.IncomingForm();
    form.parse(req,function(error,fields,files){ 
        console.log( fields );

        var srcfile = files.file.path;
        var uploadfilePath = process.cwd()+"/public/file/handwriting"; 
        if( !fs.existsSync(uploadfilePath) ){
		      fs.mkdirSync(uploadfilePath );
        }
        var desfile = uploadfilePath + '/' + files.file.name;
        console.log( desfile );

        //fs.renameSync(files.file.path, uploadfilePath);
        // error:  cross-device link not permitted
        var readStream = fs.createReadStream(srcfile)
        var writeStream = fs.createWriteStream(desfile);
        readStream.pipe( writeStream );
        readStream.on( "end", function(){
            fs.unlinkSync(srcfile);
            res.send( 'ok!' );
        } );
    });  
}

exports.upload = upload;