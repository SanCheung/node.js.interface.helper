var express = require('express');
var router = express.Router();
var xapi = require( './api/xapi' )

// 普通上传
var stu = require( './api/stdUpload' )

// 手迹上传
var hwu = require( './api/hwUpload' )


//function getClientIp(req) {
////    return req.headers['x-forwarded-for'] ||
////        req.connection.remoteAddress ||
////        req.socket.remoteAddress ||
////        req.connection.socket.remoteAddress;
//    
//    return req.connection.remoteAddress;
//};

/* GET users listing. */
router.get('/', function(req, res, next) {
    //console.log( getClientIp( req ) );
    res.render('api');
});

// /api/GetMeetingInfo
router.get('/GetMeetingInfo', function(req, res, next) {
    var m = {   'id':       'cl_ID',
                'title':    'cl_Title',
                'chairman': 'cl_Chairman',
                'assist': 	'cl_Assist',
                'service': 	'cl_Service',
                'time': 	'cl_Time',
                'address': 	'cl_Address',
                'room': 	'cl_Room',
                'topic':            'cl_Topic',
                'introduce':        'cl_Introduce',
                'remindtitle': 	    'cl_RemindTitle',
                'remindcontent':    'cl_RemindContent',
                'issuetabletitle':  'cl_IssueTableTitle',
                'documentURL':      'cl_DocumentURL',
                'isSecret':         'cl_IsSecret'
            };
    
    return xapi.info( res, 'SELECT t.* FROM tab_meeting t, tab_system_setting s  WHERE t.cl_ID=s.cl_CurrentMeetingID AND t.cl_Deleted=0', m );
});


// /api/GetSeatNo?ip=192.168.0.11
router.get('/GetSeatNo', function(req, res, next) {
    return xapi.infoWithParam(  req, res, 
                                'SELECT cl_SeatNo FROM tab_ipmap WHERE cl_ClientIP=?',
                                [ 'ip' ],
                                { 'seatNo': 'cl_SeatNo' } );
});


// /api/GetUserBySeatNo?seatno=1
router.get('/GetUserBySeatNo', function(req, res, next) {
    var m = {   'id':           'cl_ID',
                'name':         'cl_Name',
                'department':   'cl_Department',
                'post':         'cl_Post',
                'seatNo':       'cl_SeatNo',
                'signTime':     'cl_SignTime',
                'permission':   'cl_Permission',
                'userID':       'cl_UserID',
                'meetingID':    'cl_MeetingID',
                'sort':         'cl_Sort',
                'type':         'cl_Type',
                'signType':     'cl_SignType',
                'signString':   'cl_SignString',
                'signURL':      'cl_URL'
            };					  
    return xapi.infoWithParam(  req, res, 
                                'SELECT u.* FROM tab_meeting_user u, tab_system_setting s WHERE u.cl_MeetingID=s.cl_CurrentMeetingID AND u.cl_SeatNo=? AND u.cl_Deleted=0',
                                [ 'seatno' ],
                                m );  
});


// /api/SetValue?key=hello&value=world
router.get('/SetValue', function(req, res, next) {
    return xapi.infoWithParam(  req, res, 
                                'CALL sp_set_key_value( ?, ? )',
                                [ 'key', 'value' ],
                                {} );
});


// /api/GetValue?key=hello
router.get('/GetValue', function(req, res, next) {
    var kvalue = xapi.requst2map( req )['key'];
    //console.log( kvalue );
    xapi.infoWithParam2(  req, res, 
                        'SELECT * FROM tab_key_value WHERE cl_Key = ?',
                        [ 'key' ],
                        ( d, r ) =>{
                            d[kvalue] = r.cl_Value;
                        });
});

// /api/GetAllValue
router.get('/GetAllValue', function(req, res, next) {
    var kvalue = xapi.requst2map( req )['key'];
    //console.log( kvalue );
    xapi.infoList2( res, 
                    'SELECT * FROM tab_key_value',
                    ( data, c ) => {
                        var k = c['cl_Key'];
                        var v = c['cl_Value'];
                        data[k] = v;
                    });
});


// 	/api/GetHomeSetting
router.get('/GetHomeSetting', function(req, res, next) {
    var m = {   'homeTitle':  'cl_LoginTitle',
                'homeSeat':   'cl_LoginSeat',
                'homeName':   'cl_LoginName',
                'homePost':   'cl_LoginPost'
            };	
    xapi.info( res, 
               'SELECT cl_LoginTitle, cl_LoginSeat, cl_LoginName, cl_LoginPost FROM tab_system_setting WHERE cl_ID=1',
                m );
});


// 	/api/GetCardSetting
router.get('/GetCardSetting', function(req, res, next) {
    var m = {   'cardTitle':  'cl_CardTitle',
                'cardSeat':   'cl_CardSeat',
                'cardName':   'cl_CardName',
                'cardPost':   'cl_CardPost'
            };	
    xapi.info( res, 
               'SELECT cl_CardTitle, cl_CardSeat, cl_CardName, cl_CardPost FROM tab_system_setting WHERE cl_ID=1',
                m );
});


// /api/GetServiceList
router.get('/GetServiceList', function(req, res, next) {
    var m = {   'id':           'cl_ID',
                'meetingID':    'cl_MeetingID',
                'seatNo':       'cl_SeatNo',
                'userName':     'cl_UserName',
                'serviceName':  'cl_ServiceName',
                'applyTime':    'cl_ApplyTime'
            };

    xapi.infoList( res, 
                   'SELECT * FROM tab_service WHERE ISNULL(cl_ReplyTime) ORDER BY cl_ReplyTime',
                   m );
});

// 	/api/ApplyService?meetingid=1&seatno=1&username=张三&servicename=茶水
router.get('/ApplyService', function(req, res, next) {
    return xapi.infoWithParam(  req, res, 
                                'INSERT INTO tab_service(cl_MeetingID, cl_SeatNo, cl_UserName, cl_ServiceName, cl_ApplyTime) VALUES(?,?,?,?,now())',
                                [ 'meetingid', 'seatno', 'username', 'servicename' ],
                                {} );
});

// 	/api/ReplyService?serviceid=1
router.get('/ReplyService', function(req, res, next) {
    return xapi.infoWithParam(  req, res, 
                                'UPDATE tab_service SET cl_ReplyTime=now() WHERE cl_ID=?',
                                [ 'serviceid' ],
                                {} );
});



// 	/api/UserSign?userid=2&seatno=2
router.get('/UserSign', function(req, res, next) {
    return xapi.infoWithParam(  req, res, 
                                'UPDATE tab_meeting_user SET cl_SignTime=now(), cl_SeatNo=? WHERE cl_ID=?',
                                [ 'seatno', 'userid' ],
                                {} );
});

// 	/api/userSign1?userid=2&string=1112
router.get('/UserSign1', function(req, res, next) {
    return xapi.infoWithParam(  req, res, 
                                'UPDATE tab_meeting_user SET cl_SignTime=now(), cl_SignString=? WHERE cl_ID=?',
                                [ 'string', 'userid' ],
                                {} );
});

// 	/api/userSign2?userid=2&url=23423423.png
router.get('/userSign2', function(req, res, next) {
    return xapi.infoWithParam(  req, res, 
                                'UPDATE tab_meeting_user SET cl_SignTime=now(), cl_SignURL=? WHERE cl_ID=?',
                                [ 'url', 'userid' ],
                                {} );
});



// /api/GetUserList
router.get('/GetUserList', function(req, res, next) {
    var m = {   'id':           'cl_ID',
                'name':         'cl_Name',
                'department':   'cl_Department',
                'post':         'cl_Post',
                'seatNo':       'cl_SeatNo',
                'signTime':     'cl_SignTime',
                'permission':   'cl_Permission',
                'userID':       'cl_UserID',
                'meetingID':    'cl_MeetingID',
                'sort':         'cl_Sort',
                'type':         'cl_Type',
                'signType':     'cl_SignType',
                'signString':   'cl_SignString',
                'signURL':      'cl_URL'
            };	
    xapi.infoList( res, 
                   'SELECT t.* FROM tab_meeting_user t, tab_system_setting s  WHERE t.cl_MeetingID=s.cl_CurrentMeetingID AND t.cl_Deleted=0 ORDER BY t.cl_SeatNo',
                   m );
});

// /api/GetIssueList
router.get('/GetIssueList', function(req, res, next) {
    var m = {   'id':           'cl_ID',
                'meetingID':    'cl_MeetingID',
                'issue':        'cl_Issue',
                'proposer':     'cl_Proposer',
                'remark':       'cl_Remark',
                'speaker':      'cl_Speaker',
                'relatedUnit':  'cl_RelatedUnit'
            };

    xapi.infoList( res, 
                   'SELECT i.* FROM tab_meeting_issue i, tab_system_setting s  WHERE i.cl_MeetingID=s.cl_CurrentMeetingID AND i.cl_Deleted=0 ORDER BY i.cl_Sort',
                   m );
});

// /api/GetFileList
router.get('/GetFileList', function(req, res, next) {
    var m = {   'id':           'cl_ID',
                'meetingID':    'cl_MeetingID',
                'issueID':      'cl_IssueID',
                'fileName':     'cl_FileName',
                'fileSize':     'cl_FileSize',
                'uploadUser':   'cl_UploadUser',
                'url':          'cl_URL',
                'remark':       'cl_Remark',
                'uploadTime':   'cl_UploadTime'
            };

    xapi.infoList( res, 
                   'SELECT f.* FROM tab_meeting_file f, tab_system_setting s  WHERE f.cl_MeetingID=s.cl_CurrentMeetingID AND f.cl_Deleted=0 ORDER BY f.cl_Sort',
                   m );
});


// /api/GetBlobByID?id=1
router.get('/GetBlobByID', function(req, res, next) {
    var id = xapi.requst2map( req );
    xapi.infoWithParam3( req, res, 'SELECT * FROM tab_image WHERE cl_ID = ?',
                         ['id'], (r) => {
                            var imgBuffer = r.cl_Data;
                            res.writeHead(200,{ "Content-Type":"application/octet-stream; charset=UTF-8",
                                                "Content-Length": imgBuffer.length, 
                                                "Content-Disposition":"attachment; filename="+r.cl_ID+".jpg"});
                            res.write( imgBuffer,"binary" );  
                            res.end();
                        });
});

// /api/GetVoteList
router.get('/GetVoteList', function(req, res, next) {
    var m = {   'id':           'cl_ID',
                'meetingID':    'cl_MeetingID',
                'title':        'cl_Title',
                'options':      'cl_Options',
                'remark':       'cl_Remark',
                'isMultiple':   'cl_IsMultiple',
                'isAnon':       'cl_IsAnon',
                'state':        'cl_State',
                'startTime':    'cl_StartTime',
                'closeTime':    'cl_CloseTime',
                'result':       'cl_Result'
            };

    xapi.infoList( res, 
                   'SELECT v.* FROM tab_vote v, tab_system_setting s  WHERE v.cl_MeetingID=s.cl_CurrentMeetingID AND v.cl_Deleted=0 ORDER BY v.cl_Sort',
                   m );
});


// /api/hwupload
router.post('/hwupload', function(req, res, next) {
    hwu.upload( req, res );
});

// /api/upload
router.post('/upload', function(req, res, next) {
    stu.upload( req, res );
});







module.exports = router;