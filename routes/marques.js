console.log("hello from marques.js");

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


// ROUTES àpd /marques/...


// GET by id_marque 
// router.get('/id/:id', ensureToken, function(req, res, next) {
//     db.pool.getConnection((err, connection) => {
//         if(err) throw err;
//         let query = 'SELECT * from marques where id_marque = ?'
//         query = mysql.format(query,[req.params.id]);
//         console.log("\tGET - marques/id/:id")
//         connection.query(query, (err, rows) => {
//             connection.release();
//             if(err) throw err;
//             res.json(rows);
//         });
//     });
// });




// get marque by nom_unique
// router.get('/nom_unique/:nom_unique', ensureToken, function(req, res, next) {
//     db.pool.getConnection((err, connection) => {
//         if(err) throw err;
//         let query = 'SELECT * from marques where nom_unique = ?'
//         query = mysql.format(query,[req.params.nom_unique]);
//         console.log("\tGET - marques/nom_unique/:nom_unique\n\t\t(récupère la marque via nom_unique)")
//         connection.query(query, (err, rows) => {
//             connection.release();
//             if(err) throw err;
//             res.json(rows);
//         });
//     });
// });













// GET toutes les marques
router.get('/', displayClientInfo, function(req, res, next){
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        //console.log('connected as id ' + connection.threadId);
        let query = 'SELECT marques.id_marque, marques.nom_unique, count(vehicules.id_vehicule) as nb_vehicules FROM `marques` left outer join vehicules on vehicules.marque = marques.id_marque group by marques.nom_unique order by marques.id_marque ASC'
        logger.info("\tGET - marques/ (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des marques ainsi que nombre de vehicules par marque)");
        console.log("\tGET - marques/ (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des marques ainsi que nombre de vehicules par marque)");
        connection.query(query, (err, rows) => {
            connection.release(); // return the connection to pool
            if(err) {
                logger.error(err);
                throw err;
            }
            //console.log('The data from users table are: \n', rows);
            res.json(rows);
        });
    });
});

// GET marques avec nb vehicules correspondants
// router.get('/nb_vehicules', displayClientInfo, ensureToken, function(req, res, next) {
//     db.pool.getConnection((err, connection) => {
//         if(err) throw err;
//         let query = 'SELECT marques.id_marque, marques.nom_unique, count(vehicules.id_vehicule) as nb_vehicules FROM `marques`,`vehicules` WHERE vehicules.marque = marques.id_marque group by marques.nom_unique'
//         console.log("GET - /marques/nb_vehicules\n\t(nombre de vehicules par marque)")
//         connection.query(query, (err, rows) => {
//             connection.release();
//             if(err) throw err;
//             res.json(rows);
//         });
//     });
// });

// GET by nom_unique
router.get('/nomUnique/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query = "SELECT * FROM marques where nom_unique = ?";
        query = mysql.format(query,[req.query.nom_unique]);

        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - marques/nomUnique (id_utilisateur: "+req.query.id_utilisateur+")\t\t(récupère marque via nom_unique)");
        console.log("\tGET - marques/nomUnique (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(récupère marque via nom_unique)");
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

// POST ajouter une nouvelle marque
router.post('/', displayClientInfo, jsonParser, function(req, res, next) {
    let query = 'INSERT INTO `marques`(`nom_unique`) VALUES (?)';
    query = mysql.format(query,[req.body.nom_unique]),
    logger.info("\tPOST - marques/ (id_utilisateur: "+req.body.id_utilisateur+")\t\t(ajout d'une nouvelle marque)");
    console.log("\tPOST - marques/ (id_utilisateur: "+req.body.id_utilisateur+")\n\t\t(ajout d'une nouvelle marque)");
    pool.query(query,(err, response) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        // rows added
        logger.info("\t\tid nouvelle marque => "+response.insertId);
        console.log("\t\tid nouvelle marque => "+response.insertId);
        res.json({status: "OK"});
    });
});


// modifier une marque
router.put('/', displayClientInfo, ensureToken, jsonParser, function(req, res, next) {
    let query = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
    query = mysql.format(query,["marques","nom_unique",req.body.nom_unique,"id_marque",req.body.id_marque]);
    logger.info("\tPUT - marques/ (id_utilisateur: "+req.body.id_utilisateur+")\t\t(modifier une marque)");
    console.log("\tPUT - marques/ (id_utilisateur: "+req.body.id_utilisateur+")\n\t\t(modifier une marque)");
    pool.query(query,(err, response) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        res.json({status: "ok"});
    });
});

// supprimer une marque
router.delete('/', displayClientInfo, ensureToken, jsonParser, function(req, res, next) {
    let numbers = JSON.parse(req.query.ids);
    let alright = true;
    for(let i of numbers){
        let query = "DELETE FROM marques WHERE marques.id_marque = ?";
        query = mysql.format(query,[i]);
        //console.log("QUERY "+query)
        logger.info("\tDELETE - marques/ (id_utilisateur: "+req.query.id_utilisateur+")\t\t(supprimer une marque)");
        console.log("\tDELETE - marques/ (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(supprimer une marque)");
        pool.query(query,(err, response) => {
            if(err) {
                logger.error(err);
                throw err;
            }
            //console.log(response)
        });
    }
    if(alright){
        res.json({status: "ok"});
    }
});


// TRI
// id
router.get('/tri/id/:type', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.params.type == 'ASC'){
            query = "SELECT marques.id_marque, marques.nom_unique, count(vehicules.id_vehicule) as nb_vehicules FROM `marques` left outer join vehicules on vehicules.marque = marques.id_marque group by marques.nom_unique order by marques.id_marque ASC";
        }
        else{
            query = "SELECT marques.id_marque, marques.nom_unique, count(vehicules.id_vehicule) as nb_vehicules FROM `marques` left outer join vehicules on vehicules.marque = marques.id_marque group by marques.nom_unique order by marques.id_marque DESC";
        }

        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - marques/ (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des marques avec nombre de véhicules par marque - tri id)");
        console.log("\tGET - marques/ (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des marques avec nombre de véhicules par marque - tri id)");
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

// nom_unique
router.get('/tri/nom_unique/:type', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.params.type == 'ASC'){
            query = "SELECT marques.id_marque, marques.nom_unique, count(vehicules.id_vehicule) as nb_vehicules FROM `marques` left outer join vehicules on vehicules.marque = marques.id_marque group by marques.nom_unique order by marques.nom_unique ASC";
        }
        else{
            query = "SELECT marques.id_marque, marques.nom_unique, count(vehicules.id_vehicule) as nb_vehicules FROM `marques` left outer join vehicules on vehicules.marque = marques.id_marque group by marques.nom_unique order by marques.nom_unique DESC";
        }

        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - marques/ (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des marques avec nombre de véhicules par marque - tri nom_unique)");
        console.log("\tGET - marques/ (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des marques avec nombre de véhicules par marque - tri nom_unique)");
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

// nb_vehicules
router.get('/tri/nb_vehicules/:type', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.params.type == 'ASC'){
            query = "SELECT marques.id_marque, marques.nom_unique, count(vehicules.id_vehicule) as nb_vehicules FROM `marques` left outer join vehicules on vehicules.marque = marques.id_marque group by marques.nom_unique order by nb_vehicules ASC";
        }
        else{
            query = "SELECT marques.id_marque, marques.nom_unique, count(vehicules.id_vehicule) as nb_vehicules FROM `marques` left outer join vehicules on vehicules.marque = marques.id_marque group by marques.nom_unique order by nb_vehicules DESC";
        }

        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - marques/ (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des marques avec nombre de véhicules par marque - tri nb_vehicules)");
        console.log("\tGET - marques/ (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des marques avec nombre de véhicules par marque - tri nb_vehicules)");
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