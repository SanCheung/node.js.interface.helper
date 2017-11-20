var $ = require('underscore');
var url = require("url");
var querystring = require("querystring");
var fs = require("fs");
var connection = require("./db").init();


function formatTime(date) {
 	if( date == undefined )
 		return "";
 	return new Date(date).toLocaleString();
};

function hello(){
    return 'hello';
}

function getMeetingInfo( req, res ){
    connection.query('SELECT t.* FROM tab_meeting t, tab_system_setting s  WHERE t.cl_ID=s.cl_CurrentMeetingID AND t.cl_Deleted=0',
    function(err, rows) {  
        var data = {};
        if (err) {  
            //throw err;
            data = { errorInfo: err.toString() };  
        }
        else {
	        if( rows == '' ){
	        	data = { errorInfo: 'no data!'};
	        }
	        else{
		        var v = rows[0];
		        data = {
		        	errorInfo: 	"",
		        	id: 		v.cl_ID, 
		        	title: 		v.cl_Title,
		            chairman: 	v.cl_Chairman,
		            assist: 	v.cl_Assist,
		            service: 	v.cl_Service,
		            time: 		formatTime( v.cl_Time ),
		            address: 	v.cl_Address,
		            room: 		v.cl_Room,
		            topic: 		v.cl_Topic,
		            introduce:	v.cl_Introduce,
		            remindtitle: 	v.cl_RemindTitle,
		            remindcontent: 	v.cl_RemindContent,
		            issuetabletitle:v.cl_IssueTableTitle,
		            documentURL: v.cl_DocumentURL,
		            isSecret: v.cl_IsSecret
		    	}; 
			}
        }


		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write(  JSON.stringify( data, null, 2 ) ); 
        res.end();
    });
}



function getServiceList( req, res ){
	// interface/GetServiceList
    connection.query('SELECT * FROM tab_service WHERE ISNULL(cl_ReplyTime) ORDER BY cl_ReplyTime', function(err, rows) { 
		var data = {}; 
		if (err){
			data = { errorInfo: err.toString() }; 
		}
		else {
			if(rows == '' ){
        		data = { errorInfo: "no data!" };
        	}
        	else {
				data = $.map(rows, function (c) {
					return  {
					  id: c.cl_ID,
					  meetingID: c.cl_MeetingID,
					  seatNo: c.cl_SeatNo,
					  userName: c.cl_UserName,
					  serviceName: c.cl_ServiceName,
					  applyTime: formatTime(c.cl_ApplyTime)
					}
				});        		
        	}

		}

		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write(  JSON.stringify( data, null, 2 ) ); 
        res.end();
    });
}

function getSeatNo( req, res ){
	// interface/GetSeatNo?ip=192.168.0.11
    var v = querystring.parse(url.parse(req.url).query);
    //console.log( v.ip );

    var sql = 'SELECT cl_SeatNo FROM tab_ipmap WHERE cl_ClientIP=?';
   	var params = [ v.ip ];

    connection.query( sql, params, function(err, rows) {  
        var data = {};
        if (err) {  
            //throw err;
            data = { errorInfo: err.toString() };  
        }
        else {
        	if(rows == '' ){
        		data = { errorInfo: "no data!" };
        	}
        	else{
	        	var v = rows[0];
		        data = {
		        	errorInfo: 	"",
		        	seatNo:     v.cl_SeatNo
		        };         		
        	}
	    }

		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write(  JSON.stringify( data, null, 2 ) ); 
        res.end();
    });
}

function applyService( req, res ){
	// interface/ApplyService?meetingid=1&seatno=1&username=张三&servicename=茶水
    var v = querystring.parse(url.parse(req.url).query);

    var sql = 'INSERT INTO tab_service(cl_MeetingID, cl_SeatNo, cl_UserName, cl_ServiceName, cl_ApplyTime) VALUES(?,?,?,?,?)';

    var now = new Date();
   	var params = [ v.meetingid, v.seatno, v.username, v.servicename, now.toLocaleString()];

    connection.query( sql, params, function(err, rows) {  
        var data = {};
        if (err) {  
            //throw err;
            data = { errorInfo: err.toString() };  
        }
        else { 
	        if(rows == '' ){
        		data = { errorInfo: "no data!" };
        	}
        	else{
	        	var v = rows[0];
		        data = {
		        	errorInfo: 	""
		        };         		
        	}
	    }

		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write( JSON.stringify( data, null, 2 ) ); 
        res.end();
    });
}

function replyService( req, res ){
	// interface/ReplyService?serviceid=1
    var v = querystring.parse(url.parse(req.url).query);
    var sql = 'UPDATE tab_service SET cl_ReplyTime=? WHERE cl_ID=?';

    var now = new Date();
   	var params = [ now.toLocaleString(), v.serviceid ];

    connection.query( sql, params, function(err, rows) {  
        var data = {};
        if (err) {  
            //throw err;
            data = { errorInfo: err.toString() };  
        }
        else { 
        	var v = rows[0];
	        data = {
	        	errorInfo: 	""
	        }; 
	    }

		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write(  JSON.stringify( data, null, 2 ) ); 
        res.end();
    });	
}

function getUserList( req, res ){
	// interface/GetUserList
    connection.query('SELECT t.* FROM tab_meeting_user t, tab_system_setting s  WHERE t.cl_MeetingID=s.cl_CurrentMeetingID AND t.cl_Deleted=0 ORDER BY t.cl_SeatNo', 
    	function(err, rows) { 
		var data = {}; 
		if (err){
			data = { errorInfo: err.toString() }; 
		}
		else {
			if(rows == '' ){
        		data = { errorInfo: "no data!" };
        	}
        	else {
				data = $.map(rows, function (c) {
					return  {
					  id: c.cl_ID,
					  name: c.cl_Name,
					  department: c.cl_Department,
					  post: c.cl_Post,
					  seatNo: c.cl_SeatNo,
					  signTime: formatTime(c.cl_SignTime),
					  permission: c.cl_Permission,
					  userID: c.cl_UserID,
					  meetingID: c.cl_MeetingID,
					  sort: c.cl_Sort,
					  type: c.cl_Type,
                      signType: c.cl_SignType,
                      signString: c.cl_SignString,
                      signURL: c.cl_URL
					}
				});        		
        	}

		}

		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write(  JSON.stringify( data, null, 2 ) ); 
        res.end();
    });
}

function userSign( req, res ){
	// interface/UserSign?userid=2&seatno=2
    var v = querystring.parse(url.parse(req.url).query);
    var sql = 'UPDATE tab_meeting_user SET cl_SignTime=?, cl_SeatNo=? WHERE cl_ID=?';

    var now = new Date();
   	var params = [ now.toLocaleString(), v.seatno, v.userid ];

    connection.query( sql, params, function(err, rows) {  
        var data = {};
        if (err) {  
            data = { errorInfo: err.toString() };  
        }
        else { 
        	var v = rows[0];
	        data = {
	        	errorInfo: 	""
	        }; 
	    }

		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write(  JSON.stringify( data, null, 2 ) ); 
        res.end();
    });
}

function userSign1( req, res ){
	// interface/UserSign?userid=2&string=1112
    var v = querystring.parse(url.parse(req.url).query);
    console.log( v );
    
    var sql = 'UPDATE tab_meeting_user SET cl_SignTime=?, cl_SignString=? WHERE cl_ID=?';

    var now = new Date();
   	var params = [ now.toLocaleString(), v.string, v.userid ];

    connection.query( sql, params, function(err, rows) {  
        var data = {};
        if (err) {  
            data = { errorInfo: err.toString() };  
        }
        else { 
        	var v = rows[0];
	        data = {
	        	errorInfo: 	""
	        }; 
	    }

		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write(  JSON.stringify( data, null, 2 ) ); 
        res.end();
    });
}

function userSign2( req, res ){
	// interface/UserSign?userid=2&url=23423423.png
    var v = querystring.parse(url.parse(req.url).query);
    var sql = 'UPDATE tab_meeting_user SET cl_SignTime=?, cl_SignURL=? WHERE cl_ID=?';

    var now = new Date();
   	var params = [ now.toLocaleString(), v.url, v.userid ];

    connection.query( sql, params, function(err, rows) {  
        var data = {};
        if (err) {  
            data = { errorInfo: err.toString() };  
        }
        else { 
        	var v = rows[0];
	        data = {
	        	errorInfo: 	""
	        }; 
	    }

		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write(  JSON.stringify( data, null, 2 ) ); 
        res.end();
    });
}

function getIssueList( req, res ){
	// interface/GetIssueList
    connection.query('SELECT i.* FROM tab_meeting_issue i, tab_system_setting s  WHERE i.cl_MeetingID=s.cl_CurrentMeetingID AND i.cl_Deleted=0 ORDER BY i.cl_Sort', function(err, rows) { 
		var data = {}; 
		if (err){
			data = { errorInfo: err.toString() }; 
		}
		else {
			if(rows == '' ){
        		data = { errorInfo: "no data!" };
        	}
        	else{
	 			data = $.map(rows, function (c) {
					return  {
					  	id: c.cl_ID,
					  	meetingID: c.cl_MeetingID,
					  	issue: c.cl_Issue,
					  	proposer: c.cl_Proposer,
					  	remark: c.cl_Remark,
					  	speaker: c.cl_Speaker,
					  	relatedUnit: c.cl_RelatedUnit,
					  	remark: c.cl_Remark
					}
				});       		
        	}
		}

		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write(  JSON.stringify( data, null, 2 ) ); 
        res.end();
    });	
}

function getFileList( req, res ){
	// interface/GetIssueList
    connection.query('SELECT f.* FROM tab_meeting_file f, tab_system_setting s  WHERE f.cl_MeetingID=s.cl_CurrentMeetingID AND f.cl_Deleted=0', function(err, rows) { 
		var data = {}; 
		if (err){
			data = { errorInfo: err.toString() }; 
		}
		else {
			if(rows == '' ){
        		data = { errorInfo: "no data!" };
        	}
        	else {
	 			data = $.map(rows, function (c) {
					return  {
					  	id: c.cl_ID,
					  	meetingID: c.cl_MeetingID,
					  	issueID: c.cl_IssueID,
					  	fileName: c.cl_FileName,
					  	fileSize: c.cl_FileSize,
					  	uploadUser: c.cl_UploadUser,
					  	url: c.cl_URL,
					  	remark: c.cl_Remark,
					  	uploadTime: formatTime(c.cl_UploadTime)
					}
				});       		
        	}

		}

		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write(  JSON.stringify( data, null, 2 ) ); 
        res.end();
    });
}

function getUserBySeatNo( req, res ){
	// interface/GetUserBySeatNo?seatno=1
    var v = querystring.parse(url.parse(req.url).query);
    //console.log( v );

    var sql = 'SELECT u.* FROM tab_meeting_user u, tab_system_setting s WHERE u.cl_MeetingID=s.cl_CurrentMeetingID AND u.cl_SeatNo=? AND u.cl_Deleted=0';
   	var params = [ v.seatno ];

    connection.query( sql, params, function(err, rows) {  
        var data = {};
        if (err) {  
            //throw err;
            data = { errorInfo: err.toString() };  
        }
        else {
        	if(rows == '' ){
        		data = { errorInfo: "no data!" };
        	}
        	else{
	        	var c = rows[0];
		        data = {
					  id: c.cl_ID,
					  name: c.cl_Name,
					  department: c.cl_Department,
					  post: c.cl_Post,
					  seatNo: c.cl_SeatNo,
					  signTime: formatTime(c.cl_SignTime),
					  permission: c.cl_Permission,
					  userID: c.cl_UserID,
					  meetingID: c.cl_MeetingID,
					  sort: c.cl_Sort,
					  type: c.cl_Type,
					  signType: c.cl_SignType,
                      signString: c.cl_SignString,
                      signURL: c.cl_URL
		        };         		
        	}
	    }

		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write(  JSON.stringify( data, null, 2 ) ); 
        res.end();
    });
}

function getAllValueDetail( req, res ){
	// interface/GetAllValue
    connection.query('SELECT * FROM tab_key_value', function(err, rows) { 
		var data = {}; 
		if (err){
			data = { errorInfo: err.toString() }; 
		}
		else {
			if(rows == '' ){
        		data = { errorInfo: "no data!" };
        	}
        	else {
				data = $.map(rows, function (c) {
					return  {
					  key: c.cl_Key,
					  value: c.cl_Value,
					  createTime: formatTime(c.cl_CreateTime),
					  updateTime: formatTime(c.cl_UpdateTime)
					}
				});        		
        	}

		}

		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write(  JSON.stringify( data, null, 2 ) ); 
        res.end();
    });
}

function getAllValue( req, res ){
	// interface/GetAllValue
    connection.query('SELECT * FROM tab_key_value', function(err, rows) { 
		var data = {}; 
		if (err){
			data = { errorInfo: err.toString() }; 
		}
		else {
			if(rows == '' ){
        		data = { errorInfo: "no data!" };
        	}
        	else {
				$.map(rows, function (c) {
					var k = c.cl_Key;
					var v = c.cl_Value;

					data[k] = v;
				});        		
        	}

		}

		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write(  JSON.stringify( data, null, 2 ) ); 
        res.end();
    });
}

function getKeyValue( req, res ){
	// interface/GetValue?key=hello
   	var v = querystring.parse(url.parse(req.url).query);
   	var key = v.key;

    var sql = 'SELECT * FROM tab_key_value WHERE cl_Key = ?';
   	var params = [ key ];

    connection.query( sql, params, function(err, rows) {  
        var data = {};
        if (err) {  
            //throw err;
            data = { errorInfo: err.toString() };  
        }
        else {
        	if(rows == '' ){
        		data = { errorInfo: "no data!" };
        	}
        	else{
	        	var c = rows[0];
		        data[key] = c.cl_Value;       		
        	}
	    }

		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write(  JSON.stringify( data, null, 2 ) ); 
        res.end();
    });
}

function setKeyValue( req, res ){
	// interface/GetValue?key=hello&value=world
   var v = querystring.parse(url.parse(req.url).query);

    var sql = 'CALL sp_set_key_value( ?, ? )';
   	var params = [ v.key, v.value ];

    connection.query( sql, params, function(err, rows) {  
        var data = {};
        if (err) {  
            //throw err;
            data = { errorInfo: err.toString() };  
        }
        // else{
        // 	console.log( rows.affectedRows );
        // }

		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write(  JSON.stringify( data, null, 2 ) ); 
        res.end();
    });
}

function getHomeSetting( req, res ){
	// interface/GetHomeSetting
    connection.query( "SELECT cl_LoginTitle, cl_LoginSeat, cl_LoginName, cl_LoginPost FROM tab_system_setting WHERE cl_ID=1", function(err, rows) {  
        var data = {};
        if (err) { 
            data = { errorInfo: err.toString() };  
        }
        else {
        	if(rows == '' ){
        		data = { errorInfo: "no data!" };
        	}
        	else{
	        	var c = rows[0];
		        data = {
					  homeTitle: c.cl_LoginTitle,
					  homeSeat: c.cl_LoginSeat,
					  homeName: c.cl_LoginName,
					  homePost: c.cl_LoginPost
		        };         		
        	}
	    }

		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write(  JSON.stringify( data, null, 2 ) ); 
        res.end();
    });	
}

function getTCSetting( req, res ){
	// interface/GetCardSetting
    connection.query( "SELECT cl_CardTitle, cl_CardSeat, cl_CardName, cl_CardPost FROM tab_system_setting WHERE cl_ID=1", function(err, rows) {  
        var data = {};
        if (err) { 
            data = { errorInfo: err.toString() };  
        }
        else {
        	if(rows == '' ){
        		data = { errorInfo: "no data!" };
        	}
        	else{
	        	var c = rows[0];
		        data = {
					  cardTitle: c.cl_CardTitle,
					  cardSeat: c.cl_CardSeat,
					  cardName: c.cl_CardName,
					  cardPost: c.cl_CardPost
		        };         		
        	}
	    }

		res.writeHead(200,{"Content-Type":"text/plain;charset=UTF-8"});
        res.write(  JSON.stringify( data, null, 2 ) ); 
        res.end();
    });	
}

//exports.root = root;
//exports.info = info;
//exports.jq = jq;
//exports.jqjs = jqjs;

exports.getMeetingInfo = getMeetingInfo;
exports.getSeatNo = getSeatNo;

exports.getServiceList = getServiceList;
exports.applyService = applyService;
exports.replyService = replyService;

exports.getUserList = getUserList;
exports.userSign = userSign;
exports.userSign1 = userSign1;
exports.userSign2 = userSign2;


exports.getIssueList = getIssueList;
exports.getFileList = getFileList;

exports.getUserBySeatNo = getUserBySeatNo;

exports.setKeyValue = setKeyValue;
exports.getKeyValue = getKeyValue;
exports.getAllValue = getAllValue;


exports.getHomeSetting = getHomeSetting;
exports.getCardSetting = getTCSetting;

exports.hello = hello;


