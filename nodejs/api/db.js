var mysql = require('mysql');
var cfg = require("./CONFIG");

var db_config = {
  host     : cfg.db_host,
  user     : cfg.db_user,
  password : cfg.db_password,
  port     : cfg.db_port,
  database : cfg.db_database,
  useConnectionPooling: true
};

var connection;
var idTimer = 0;

function handleConnect(){
  if( connection != undefined ){
    return connection;
  }

    console.log( "Try to connect..." );
    connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('ERROR! Connecting to db:', err);
      connection = undefined;
      idTimer = setInterval(handleConnect, 2000);      // We introduce a delay before attempting to reconnect,
    }                                        // to avoid a hot loop, and to allow our node script to
    else {
        if( idTimer != 0 ){
            clearInterval( idTimer );
            idTimer = 0;  
        }
        console.log( "db OK!" );
    }
  });                                         // process asynchronous requests in the meantime.
                                              // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {   // Connection to the MySQL server is usually
        connection = undefined;
        handleConnect();                        // lost due to either server restart, or a
    } else {                                        // connnection idle timeout (the wait_timeout
      throw err;                                    // server variable configures this)
    }
  });

  return connection; 
}

exports.db = handleConnect;