/**
 * Load environment variables from file
 */
// exécuter la commande 
// #export NODE_ENV=development pour le mettre en mode développement
if (process.env.NODE_ENV === 'development') {
    require('dotenv').config();
}

const db = require('./modules/db_connection');
const server = require('./modules/server');

db.connect().then(server.start());
