/**
 * Load modules
 */

const express = require('express');
const utilisateurRouter = require('../routes/utilisateurs');
const vehiculeRouter = require('../routes/vehicules');
const marqueRouter = require('../routes/marques');
const ligneRouter = require('../routes/lignes');
const statistiqueRouter = require('../routes/statistiques');
const downloadRouter = require('../routes/download');
const fs = require('fs');
const https = require('https');

/**
 * Variables
 */

// Global variables
const host = process.env.SERVER_HOST;
const port = process.env.SERVER_PORT;
const app = express();
const options = {
    key: fs.readFileSync('/root/.acme.sh/michiels.zapto.org_ecc/michiels.zapto.org.key'),
    cert: fs.readFileSync('/root/.acme.sh/michiels.zapto.org_ecc/michiels.zapto.org.cer')
};

/**
 * Configuration
 */

// Configure routes
app.use('/utilisateurs', utilisateurRouter);
app.use('/vehicules', vehiculeRouter);
app.use('/marques', marqueRouter);
app.use('/lignes', ligneRouter);
app.use('/statistiques', statistiqueRouter);
app.use('/download', downloadRouter);



// HTTP
// Start server
// var start = function (callback) {
//     app.listen(port, host, () => {
//         console.info(`[Server] Listening on https://${host}:${port}`);
//         if (callback) callback(null);
//     })
// };

// HTTPS
const server = https.createServer(options, app);
var start = function (callback) {
    server.listen(port, () => {
        console.info(`[Server] Listening on https://${host}:${port}`);
        //if (callback) callback(null);
    });
};    


/**
 * Exports
 */
exports.start = start;