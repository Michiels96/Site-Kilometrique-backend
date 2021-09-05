var mysql = require('mysql'); 

var bodyParser = require('body-parser');
// create application/json parser
var jsonParser = bodyParser.json();


const db = require('../../modules/db_connection')


module.exports = {
    mysql: mysql,
    bodyParser: bodyParser,
    jsonParser: jsonParser,
    db: db
}

