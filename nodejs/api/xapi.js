var url = require("url");
var qs = require("querystring");

var fs = require("fs");
var $ = require('underscore');
var connection = require("./db").init();

// 格式化时间
function formatTime(date) {
 	if( date == undefined )
 		return "";
 	return new Date(date).toLocaleString();
};

// 将http Request的参数表，map化
function requst2map( req ){
    return qs.parse(url.parse(req.url).query);
}

// 将db字段映射到变量表
function row2map( r, m ){
    var data = {};
    for( var k in m ){
        if( m[k].indexOf('Time') == -1 ){
            data[k] = r[m[k]];
        }
        else{
            data[k] = formatTime( r[m[k]] );
        }
    }
    
    return data;
}

// 获取单一数据列（不带参数）
function info( res, sql, m ){
    connection.query( sql, (err, rows)=> {  
        var data = {};
        if (err) {  
            data = { errorInfo: err.toString() };  
        }
        else {
	        if( rows == '' ){
	        	data = { errorInfo: 'no data!'};
	        }
	        else{
                data = row2map( rows[0], m );
			}
        }

        res.send( data );
    });
}

// 获取单一数据列（带参数）
function infoWithParam( req, res, sql, params, m ){
    var mapReq = requst2map( req );
    var aq = [];
    for( var p in params ){
        aq.push( mapReq[ params[p] ] );
    }
    
    connection.query( sql, aq, (err, rows)=> {  
        var data = {};
        if (err) {  
            data = { errorInfo: err.toString() };  
        }
        else {
	        if( rows == '' ){
	        	data = { errorInfo: 'no data!'};
	        }
	        else{
                data = row2map( rows[0], m );
			}
        }

        res.send( data );
    });
}

// 获取单一数据列（带参数），自定义函数输入格式
function infoWithParam2( req, res, sql, params, fn ){
    var mapReq = requst2map( req );
    var aq = [];
    for( var p in params ){
        aq.push( mapReq[ params[p] ] );
    }
    
    connection.query( sql, aq, (err, rows)=> {  
        var data = {};
        if (err) {  
            data = { errorInfo: err.toString() };  
        }
        else {
	        if( rows == '' ){
	        	data = { errorInfo: 'no data!'};
	        }
	        else{
                fn( data, rows[0] );
			}
        }

        res.send( data );
    });
}


// 获取单一数据列（带参数），自定义函数输入
function infoWithParam3( req, res, sql, params, fn ){
    var mapReq = requst2map( req );
    var aq = [];
    for( var p in params ){
        aq.push( mapReq[ params[p] ] );
    }
    
    connection.query( sql, aq, (err, rows)=> {  
        if (err) {  
            res.send( { errorInfo: err.toString() } );  
        }
        else {
	        if( rows == '' ){
	        	res.send( { errorInfo: 'no data!'} );
	        }
	        else{
                fn( rows[0] );
			}
        }
    });
}



// 获取多行数据列（不带参数）
function infoList( res, sql, m ){
   connection.query( sql, (err, rows)=> { 
		var data = {}; 
		if (err){
			data = { errorInfo: err.toString() }; 
		}
		else {
			if(rows == '' ){
        		data = { errorInfo: "no data!" };
        	}
        	else {
				data = $.map(rows, (c)=> {
					return row2map( c, m );
				});        		
        	}

		}
		res.send( data );
    });    
}


// 获取多行数据列（不带参数），自定义函数输入格式
function infoList2( res, sql, fn ){
   connection.query( sql, (err, rows)=> { 
		var data = {}; 
		if (err){
			data = { errorInfo: err.toString() }; 
		}
		else {
			if(rows == '' ){
        		data = { errorInfo: "no data!" };
        	}
        	else {
				$.map(rows, (c)=> {
					fn( data, c );
				});        		
        	}

		}
		res.send( data );
    });    
}



// 获取多行数据列（带参数）
function infoListWithParam( req, res, sql, params, m ){
    var mapReq = requst2map( req );
    var aq = [];
    for( var p in params ){
        aq.push( mapReq[ params[p] ] );
    }
    
    connection.query( sql, aq, (err, rows)=> { 
		var data = {}; 
		if (err){
			data = { errorInfo: err.toString() }; 
		}
		else {
			if(rows == '' ){
        		data = { errorInfo: "no data!" };
        	}
        	else {
				data = $.map(rows, (c)=> {
					return row2map( c, m );
				});        		
        	}

		}
		res.send( data );
    });    
}


function getUserList( req, res ){
	// interface/GetUserList
    infoList( res, 'SELECT t.* FROM tab_meeting_user t, tab_system_setting s  WHERE t.cl_MeetingID=s.cl_CurrentMeetingID AND t.cl_Deleted=0 ORDER BY t.cl_SeatNo', 
              (c)=> {
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

exports.requst2map = requst2map;

exports.info = info;
exports.infoWithParam = infoWithParam;
exports.infoWithParam2 = infoWithParam2;
exports.infoWithParam3 = infoWithParam3;

exports.infoList = infoList;
exports.infoList2 = infoList2;
exports.infoListWithParam = infoListWithParam;
