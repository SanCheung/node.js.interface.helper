var querystring = require("querystring"), 
    url = require("url"), 
    fs = require("fs"),    
    formidable = require("formidable"); 


function returnMkdirError( res ){
	data = {
		    errorInfo: 	"目录存在字符 \\/:*?\"<>|"
	};
	res.writeHead(200,{"Content-Type":"text/html"});
	res.write(  JSON.stringify( data, null, 2 ) ); 
	res.end();
}

function upload(req,res, rootdir){ 
    var form = new formidable.IncomingForm();
    //form.encoding = 'utf-8';

    form.parse(req,function(error,fields,files){ 
        // console.log("parsing is over.........");
        //console.log( fields );

        var dir1 = fields.dir1;
        var dir2 = fields.dir2;
        //console.log( dir1 );
        //console.log( dir2 );
        console.log(dir1 + "/" + dir2 + "/" + files.file.name);
    
        var srcfile = files.file.path;
       
        //var dir = process.cwd() + "/public/file";
        var dir = process.cwd() + rootdir;
        if( !fs.existsSync(dir) ){
        	fs.mkdirSync(dir, (err)=>{
        		if( err ){
        			returnMkdirError( res );
        			return;
        		}
        	});
        }
        //console.log( dir );

        if( dir1 != undefined  && dir1.length > 0 ){
	        dir += "/" + dir1;
	        if( !fs.existsSync(dir) ){
	        	fs.mkdirSync(dir, (err)=>{
	        		if( err ){
	        			returnMkdirError( res );
	        			return;
	        		}
	        	});
	        }  

	        //console.log( dir );

	        if( dir2 != undefined && dir2.length > 0 ){
		        dir += "/" + dir2;
		        if( !fs.existsSync(dir) ){
		        	fs.mkdirSync(dir, (err)=>{
		        		if( err ){
		        			returnMkdirError( res );
		        			return;
		        		}
        			});
		        }
	        } 

	        //console.log( dir );
	    }

        var desfile = dir + "/" + files.file.name;
        //console.log( desfile );

     	var data = {}; 

        //fs.renameSync(files.file.path, uploadfilePath);
        // error:  cross-device link not permitted
        var readStream = fs.createReadStream(srcfile)
        var writeStream = fs.createWriteStream(desfile);
        readStream.pipe( writeStream );
        readStream.on( "end", function(){
            fs.unlinkSync(srcfile);
            data = {
	        	errorInfo: 	"",
	        	url: desfile
	        }; 
	        res.writeHead(200,{"Content-Type":"text/html;charset=UTF-8"});
        	res.write(  JSON.stringify( data, null, 2 ) ); 
        	res.end();
        } );



        ////////////////////////////
		// 最新版本Node.js已经弃用pipe
        //util.pipe(readStream, writeStream, function() {
        //    fs.unlinkSync(srcfile);
        //    
        //    res.writeHead(200,{"Content-Type":"text/html"}); 
        //    res.write("ok!");  
        //    //res.write("received image:<br/>");  
        //    //res.write("<img src='/show?filename=" + files.file.name + "'/>");  
        //    res.end();  
        //});
    });;  
}

exports.upload = upload;