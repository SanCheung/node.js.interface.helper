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

function handleConnect(){
  //console.log( "createConnection " + connection );
  if( connection != undefined ){
    return connection;
  }

  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleConnect, 2000);      // We introduce a delay before attempting to reconnect,
    }                                         // to avoid a hot loop, and to allow our node script to
  });                                         // process asynchronous requests in the meantime.
                                              // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') {   // Connection to the MySQL server is usually
      handleConnect();                            // lost due to either server restart, or a
    } else {                                        // connnection idle timeout (the wait_timeout
      throw err;                                    // server variable configures this)
    }
  });

  return connection; 
}

//handleConnect();
exports.init = handleConnect;