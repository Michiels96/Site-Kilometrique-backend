console.log("hello from statistiques.js");

var express = require('express');
var cors = require('cors'); 
var router = express.Router();
router.use(cors());

const {
    mysql,
    db,
    jsonParser
} = require('../modules/variables/common');


const {
    displayClientInfo,
    ensureToken
} = require('../modules/variables/jwt');

const {
    logger: logger
} = require('../modules/variables/winston-logger');


// ROUTES àpd /statistiques/...


router.get('/utilisateur/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) throw err;
        let query = "SELECT statistiques.id_statistique, statistiques.utilisateur, statistiques.description, statistiques.dateDAjout, statistiques.dateDeModification from statistiques where statistiques.utilisateur = ? order by statistiques.dateDAjout DESC";
        query = mysql.format(query,[req.query.id_utilisateur]);
        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - statistiques/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des statistiques en fct de l'utilisateur)");
        console.log("\tGET - statistiques/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des statistiques en fct de l'utilisateur)");
        connection.query(query, (err, rows) => {
            connection.release(); // return the connection to pool
            if(err){
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});

// modifier une statistique
router.put('/', displayClientInfo, ensureToken, jsonParser, function(req, res, next){
    let query = "UPDATE statistiques SET description = ?, dateDAjout = ? WHERE id_statistique = ?";
    query = mysql.format(query,[req.body.description,req.body.date,req.body.id_statistique]);
    logger.info("\tPUT - statistiques/ (id_utilisateur: "+req.body.id_utilisateur+")\t\t(modifier une statistique)");
    console.log("\tPUT - statistiques/ (id_utilisateur: "+req.body.id_utilisateur+")\n\t\t(modifier une statistique)");
    pool.query(query,(err, response) => {
        if(err) {
            logger.error(err);
            console.error(err);
            return;
        }
        res.json({status: "ok"});
    });
});

// maj. de la stat nbKilometresCumules
router.put('/majKM', displayClientInfo, ensureToken, jsonParser, function(req, res, next){
    let query = "UPDATE statistiques as a set a.description = concat('Total des kilomètres cumulés ', (select b.nbKilometresCumules from utilisateurs as b where a.utilisateur = b.id_utilisateur)) where a.description like 'Total des kilomètres cumulés%' and a.utilisateur = ?";
    query = mysql.format(query,[req.body.id_utilisateur]);
    logger.info("PUT - statistiques/ (id_utilisateur: "+req.body.id_utilisateur+")\t\t(maj. de la stat. nbKilometresCumules) en fct de l'utilisateur");
    console.log("\tPUT - statistiques/ (id_utilisateur: "+req.body.id_utilisateur+")\n\t\t(maj. de la stat. nbKilometresCumules) en fct de l'utilisateur");
    pool.query(query,(err, response) => {
        if(err) {
            logger.error(err);
            console.error(err);
            return;
        }
        res.json({status: "ok"});
    });
});

// ajouter la statistique Nombre total des kilomètres cumulés
router.post('/utilisateur', displayClientInfo, jsonParser, function(req, res, next){
    let query = "INSERT INTO statistiques (utilisateur, description) values ((select id_utilisateur from utilisateurs where email = ?), 'Total des kilomètres cumulés 0')";

    query = mysql.format(query,[req.body.email]);
    logger.info("POST - statistiques (id_utilisateur: "+req.body.id_utilisateur+" '-1' lors inscription)\t\t(ajout de la statistique: Nombre total des kilomètres cumulés)");
    console.log("\tPOST - statistiques (id_utilisateur: "+req.body.id_utilisateur+" '-1' lors inscription)\n\t\t(ajout de la statistique: Nombre total des kilomètres cumulés)");
    pool.query(query,(err, response) => {
        if(err) {
            logger.error(err);
            console.error(err);
            return;
        }
        logger.info("\t\tid nouvelle statistique => "+response.insertId);
        console.log("\t\tid nouvelle statistique => "+response.insertId);
        res.json({status: "OK"});
    });
});

// supprimer des statistiques
router.delete('/', displayClientInfo, ensureToken, jsonParser, function(req, res, next) {
    let numbers = JSON.parse(req.query.ids);
    let alright = true;
    for(let i of numbers){
        let query = "DELETE FROM statistiques WHERE statistiques.id_statistique = ?";
        query = mysql.format(query,[i]);
        logger.info("DELETE - statistiques/ (id_utilisateur: "+req.query.id_utilisateur+")\t\t(supprimer une statistique)");
        console.log("\tDELETE - statistiques/ (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(supprimer une statistique)");
        pool.query(query,(err, response) => {
            if(err) {
                logger.error(err);
                console.error(err);
                alright = false;
                return;
            }
        });
    }
    if(alright){
        res.json({status: "ok"});
    }
});

// POST ajouter une nouvelle statistique
router.post('/', displayClientInfo, jsonParser, function(req, res, next) {
    let query = 'INSERT INTO statistiques(utilisateur,description) VALUES (?,?)';
    query = mysql.format(query,[req.body.utilisateur, req.body.description]),
    logger.info("POST - statistiques/ (id_utilisateur: "+req.query.utilisateur+")\t\t(ajout d'une nouvelle statistique)");
    console.log("\tPOST - statistiques/ (id_utilisateur: "+req.query.utilisateur+")\n\t\t(ajout d'une nouvelle statistique)");
    pool.query(query,(err, response) => {
        if(err) {
            logger.error(err);
            console.error(err);
            return;
        }
        // rows added
        logger.info("\t\tid nouvelle statistique => "+response.insertId);
        console.log("\t\tid nouvelle statistique => "+response.insertId);
        res.json({status: "OK"});
    });
});

// TRI
// dateDAjout
router.get('/utilisateur/tri/dateDAjout/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) throw err;
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT statistiques.id_statistique, statistiques.utilisateur, statistiques.description, statistiques.dateDAjout, statistiques.dateDeModification from statistiques where statistiques.utilisateur = ? order by statistiques.dateDAjout ASC";
        }
        else{
            query = "SELECT statistiques.id_statistique, statistiques.utilisateur, statistiques.description, statistiques.dateDAjout, statistiques.dateDeModification from statistiques where statistiques.utilisateur = ? order by statistiques.dateDAjout DESC";
        }

        query = mysql.format(query,[req.query.id_utilisateur]);

        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - statistiques/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des statistiques en fct de l'utilisateur - tri dateDAjout)");
        console.log("\tGET - statistiques/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des statistiques en fct de l'utilisateur - tri dateDAjout)");
        connection.query(query, (err, rows) => {
            connection.release(); // return the connection to pool
            if(err){
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});

// dateDeModification
router.get('/utilisateur/tri/dateDeModification/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) throw err;
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT statistiques.id_statistique, statistiques.utilisateur, statistiques.description, statistiques.dateDAjout, statistiques.dateDeModification from statistiques where statistiques.utilisateur = ? order by statistiques.dateDeModification ASC";
        }
        else{
            query = "SELECT statistiques.id_statistique, statistiques.utilisateur, statistiques.description, statistiques.dateDAjout, statistiques.dateDeModification from statistiques where statistiques.utilisateur = ? order by statistiques.dateDeModification DESC";
        }

        query = mysql.format(query,[req.query.id_utilisateur]);

        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - statistiques/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des statistiques en fct de l'utilisateur - tri dateDeModification)");
        console.log("\tGET - statistiques/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des statistiques en fct de l'utilisateur - tri dateDeModification)");
        connection.query(query, (err, rows) => {
            connection.release(); // return the connection to pool
            if(err){
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});


/**
 * Exports
 */
 module.exports = router