var mysql = require('mysql'); 

let connect = () => {
  return new Promise((resolve, reject) => {
    pool = mysql.createPool({
      connectionLimit: process.env.DB_LIMIT,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DB
    });
    //console.log(process.env.DB_DB)


    pool.getConnection(function(err, connection) {
      if(err){
        console.error(err);
      }
      if(connection.state === 'connected'){
        console.log("DB Connecté");
        connection.release();
        exports.pool = pool
        resolve(exports.pool)
      }
    });
  });
};

exports.connect = connect

exports.db = null