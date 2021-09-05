console.log("hello from lignes.js");

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


// ROUTES àpd /lignes/...

router.get('/utilisateur/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query = "SELECT lignes.id_ligne, vehicules.nom_unique as vehicule, lignes.nbKilometres, lignes.nbKilometresDepart, lignes.nbKilometresCumules, lignes.description, lignes.date from lignes inner join vehicules on vehicules.id_vehicule = lignes.vehicule where vehicules.utilisateur = ? order by lignes.nbKilometresCumules DESC";
        query = mysql.format(query,[req.query.id_utilisateur]);
        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - lignes/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des lignes avec nom des véhicules en fct de l'utilisateur)");
        console.log("\tGET - lignes/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des lignes avec nom des véhicules en fct de l'utilisateur)");
        connection.query(query, (err, rows) => {
            connection.release(); // return the connection to pool
            if(err) {
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});

router.get('/utilisateur/nbLignes/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query = "SELECT count(lignes.id_ligne) as number from lignes inner join vehicules on vehicules.id_vehicule = lignes.vehicule where vehicules.utilisateur = ?";
        query = mysql.format(query,[req.query.id_utilisateur]);
        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - lignes/utilisateur/nbLignes (id_utilisateur: "+req.query.id_utilisateur+")\t\t(nombre de lignes en fct de l'utilisateur)");
        console.log("\tGET - lignes/utilisateur/nbLignes (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(nombre de lignes en fct de l'utilisateur)");
        connection.query(query, (err, rows) => {
            connection.release(); // return the connection to pool
            if(err) {
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});

// POST ajouter une nouvelle ligne
router.post('/', displayClientInfo, jsonParser, function(req, res, next) {
    let query;
    console.log(req.body)
    if(req.body.description == undefined){
        query = 'INSERT INTO lignes(vehicule,nbKilometres,nbKilometresDepart,date) VALUES ((select vehicules.id_vehicule from vehicules where vehicules.nom_unique = ?), ?, ?, ?)';
        query = mysql.format(query,[req.body.vehicule,req.body.nbKilometres,req.body.nbKilometresDepart,req.body.date]);
    }
    else{
        query = 'INSERT INTO lignes(vehicule,nbKilometres,nbKilometresDepart,description,date) VALUES ((select vehicules.id_vehicule from vehicules where vehicules.nom_unique = ?), ?, ?, ?, ?)';    
        query = mysql.format(query,[req.body.vehicule,req.body.nbKilometres,req.body.nbKilometresDepart,req.body.description,req.body.date]);
    }
    logger.info("\tPOST - lignes/ (id_utilisateur: "+req.body.id_utilisateur+")\t\t(ajout d'une nouvelle ligne)");
    console.log("\tPOST - lignes/ (id_utilisateur: "+req.body.id_utilisateur+")\n\t\t(ajout d'une nouvelle ligne)");
    pool.query(query,(err, response) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        // rows added
        logger.info("\t\tid nouvelle ligne => "+response.insertId);
        console.log("\t\tid nouvelle ligne => "+response.insertId);
        res.json({status: "OK"});
    });
});


// modifier une ligne
router.put('/', displayClientInfo, ensureToken, jsonParser, function(req, res, next) {
    let query = "UPDATE lignes SET vehicule = (select id_vehicule from vehicules where nom_unique = ?), nbKilometres = ?, description = ?, date = ? WHERE id_ligne = ?";
    query = mysql.format(query,[req.body.vehicule,req.body.nbKilometres,req.body.description,req.body.date,req.body.id_ligne]);
    logger.info("\tPUT - lignes/ (id_utilisateur: "+req.body.id_utilisateur+")\t\t(modifier une ligne)");
    console.log("\tPUT - lignes/ (id_utilisateur: "+req.body.id_utilisateur+")\n\t\t(modifier une ligne)");
    pool.query(query,(err, response) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        res.json({status: "ok"});
    });
});

// maj. du nbKilometresCumules
router.put('/majKM', displayClientInfo, ensureToken, jsonParser, function(req, res, next) {
    let query = "UPDATE lignes as a set a.nbKilometresCumules = (select sum(b.nbKilometres) from lignes as b where b.id_ligne <= a.id_ligne)";
    logger.info("\tPUT - lignes/ (id_utilisateur: "+req.body.id_utilisateur+")\t\t(maj. du nbKilometresCumules)");
    console.log("\tPUT - lignes/ (id_utilisateur: "+req.body.id_utilisateur+")\n\t\t(maj. du nbKilometresCumules)");
    pool.query(query,(err, response) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        res.json({status: "ok"});
    });
});

// supprimer des lignes
router.delete('/', displayClientInfo, ensureToken, jsonParser, function(req, res, next) {
    let numbers = JSON.parse(req.query.ids);
    let alright = true;
    for(let i of numbers){
        let query = "DELETE FROM lignes WHERE lignes.id_ligne = ?";
        query = mysql.format(query,[i]);
        logger.info("\tDELETE - lignes/ (id_utilisateur: "+req.query.id_utilisateur+")\t\t(supprimer une ligne)");
        console.log("\tDELETE - lignes/ (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(supprimer une ligne)");
        pool.query(query,(err, response) => {
            if(err) {
                logger.error(err);
                throw err;
            }
        });
    }
    if(alright){
        res.json({status: "ok"});
    }
});

// TRI
// id
router.get('/utilisateur/tri/id/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT lignes.id_ligne, vehicules.nom_unique as vehicule, lignes.nbKilometres, lignes.nbKilometresCumules, lignes.description, lignes.date from lignes inner join vehicules on vehicules.id_vehicule = lignes.vehicule where vehicules.utilisateur = ? order by lignes.id_ligne ASC";
        }
        else{
            query = "SELECT lignes.id_ligne, vehicules.nom_unique as vehicule, lignes.nbKilometres, lignes.nbKilometresCumules, lignes.description, lignes.date from lignes inner join vehicules on vehicules.id_vehicule = lignes.vehicule where vehicules.utilisateur = ? order by lignes.id_ligne DESC";
        }

        query = mysql.format(query,[req.query.id_utilisateur]);

        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - lignes/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des lignes avec nom des véhicules en fct de l'utilisateur - tri id)");
        console.log("\tGET - lignes/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des lignes avec nom des véhicules en fct de l'utilisateur - tri id)");
        connection.query(query, (err, rows) => {
            connection.release(); // return the connection to pool
            if(err) {
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});

// vehicule
router.get('/utilisateur/tri/vehicule/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT lignes.id_ligne, vehicules.nom_unique as vehicule, lignes.nbKilometres, lignes.nbKilometresCumules, lignes.description, lignes.date from lignes inner join vehicules on vehicules.id_vehicule = lignes.vehicule where vehicules.utilisateur = ? order by vehicule ASC, lignes.date ASC, lignes.id_ligne ASC";
        }
        else{
            query = "SELECT lignes.id_ligne, vehicules.nom_unique as vehicule, lignes.nbKilometres, lignes.nbKilometresCumules, lignes.description, lignes.date from lignes inner join vehicules on vehicules.id_vehicule = lignes.vehicule where vehicules.utilisateur = ? order by vehicule DESC, lignes.date DESC, lignes.id_ligne DESC";
        }

        query = mysql.format(query,[req.query.id_utilisateur]);

        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - lignes/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des lignes avec nom des véhicules en fct de l'utilisateur - tri vehicule)");
        console.log("\tGET - lignes/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des lignes avec nom des véhicules en fct de l'utilisateur - tri vehicule)");
        connection.query(query, (err, rows) => {
            connection.release(); // return the connection to pool
            if(err) {
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});

// nbKilometres
router.get('/utilisateur/tri/kilometres/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT lignes.id_ligne, vehicules.nom_unique as vehicule, lignes.nbKilometres, lignes.nbKilometresCumules, lignes.description, lignes.date from lignes inner join vehicules on vehicules.id_vehicule = lignes.vehicule where vehicules.utilisateur = ? order by lignes.nbKilometres ASC, lignes.date ASC, lignes.id_ligne ASC";
        }
        else{
            query = "SELECT lignes.id_ligne, vehicules.nom_unique as vehicule, lignes.nbKilometres, lignes.nbKilometresCumules, lignes.description, lignes.date from lignes inner join vehicules on vehicules.id_vehicule = lignes.vehicule where vehicules.utilisateur = ? order by lignes.nbKilometres DESC, lignes.date DESC, lignes.id_ligne DESC";
        }

        query = mysql.format(query,[req.query.id_utilisateur]);

        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - lignes/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des lignes avec nom des véhicules en fct de l'utilisateur - tri nbKilometres)");
        console.log("\tGET - lignes/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des lignes avec nom des véhicules en fct de l'utilisateur - tri nbKilometres)");
        connection.query(query, (err, rows) => {
            connection.release(); // return the connection to pool
            if(err) {
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});

// nbKilometresCumules
router.get('/utilisateur/tri/kilometresCumules/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT lignes.id_ligne, vehicules.nom_unique as vehicule, lignes.nbKilometres, lignes.nbKilometresCumules, lignes.description, lignes.date from lignes inner join vehicules on vehicules.id_vehicule = lignes.vehicule where vehicules.utilisateur = ? order by lignes.nbKilometresCumules ASC, lignes.date ASC, lignes.id_ligne ASC";
        }
        else{
            query = "SELECT lignes.id_ligne, vehicules.nom_unique as vehicule, lignes.nbKilometres, lignes.nbKilometresCumules, lignes.description, lignes.date from lignes inner join vehicules on vehicules.id_vehicule = lignes.vehicule where vehicules.utilisateur = ? order by lignes.nbKilometresCumules DESC, lignes.date DESC, lignes.id_ligne DESC";
        }

        query = mysql.format(query,[req.query.id_utilisateur]);

        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - lignes/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des lignes avec nom des véhicules en fct de l'utilisateur - tri nbKilometresCumules)");
        console.log("\tGET - lignes/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des lignes avec nom des véhicules en fct de l'utilisateur - tri nbKilometresCumules)");
        connection.query(query, (err, rows) => {
            connection.release(); // return the connection to pool
            if(err) {
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});

// description
router.get('/utilisateur/tri/description/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT lignes.id_ligne, vehicules.nom_unique as vehicule, lignes.nbKilometres, lignes.nbKilometresCumules, lignes.description, lignes.date from lignes inner join vehicules on vehicules.id_vehicule = lignes.vehicule where vehicules.utilisateur = ? order by lignes.description ASC";
        }
        else{
            query = "SELECT lignes.id_ligne, vehicules.nom_unique as vehicule, lignes.nbKilometres, lignes.nbKilometresCumules, lignes.description, lignes.date from lignes inner join vehicules on vehicules.id_vehicule = lignes.vehicule where vehicules.utilisateur = ? order by lignes.description DESC";
        }

        query = mysql.format(query,[req.query.id_utilisateur]);

        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - lignes/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des lignes avec nom des véhicules en fct de l'utilisateur - tri description)");
        console.log("\tGET - lignes/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des lignes avec nom des véhicules en fct de l'utilisateur - tri description)");
        connection.query(query, (err, rows) => {
            connection.release(); // return the connection to pool
            if(err) {
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});

// description
router.get('/utilisateur/tri/date/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT lignes.id_ligne, vehicules.nom_unique as vehicule, lignes.nbKilometres, lignes.nbKilometresCumules, lignes.description, lignes.date from lignes inner join vehicules on vehicules.id_vehicule = lignes.vehicule where vehicules.utilisateur = ? order by lignes.date ASC, lignes.id_ligne ASC";
        }
        else{
            query = "SELECT lignes.id_ligne, vehicules.nom_unique as vehicule, lignes.nbKilometres, lignes.nbKilometresCumules, lignes.description, lignes.date from lignes inner join vehicules on vehicules.id_vehicule = lignes.vehicule where vehicules.utilisateur = ? order by lignes.date DESC, lignes.id_ligne DESC";
        }

        query = mysql.format(query,[req.query.id_utilisateur]);

        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - lignes/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des lignes avec nom des véhicules en fct de l'utilisateur - tri date)");
        console.log("\tGET - lignes/utilisateur (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des lignes avec nom des véhicules en fct de l'utilisateur - tri date)");
        connection.query(query, (err, rows) => {
            connection.release(); // return the connection to pool
            if(err) {
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