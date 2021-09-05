console.log("hello from vehicules.js");

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


// ROUTES àpd /vehicules/...

// router.get('/', displayClientInfo, ensureToken, function(req, res, next){
//     db.pool.getConnection((err, connection) => {
//         if(err) throw err;
//         //console.log('connected as id ' + connection.threadId);
//         console.log("\tGET - vehicules\n\t\t(liste des vehicules)")
//         connection.query('SELECT * from vehicules', (err, rows) => {
//             connection.release(); // return the connection to pool
//             if(err) throw err;
//             //console.log('The data from users table are: \n', rows);
//             res.json(rows);
//         });
//     });
// });


// GET by id_vehicule 
// router.get('/id/:id', displayClientInfo, ensureToken, function(req, res, next) {
//     db.pool.getConnection((err, connection) => {
//         if(err) throw err;
//         let query = 'SELECT * from vehicules where id_vehicule = ?'
//         query = mysql.format(query,[req.params.id]);
//         console.log("\tGET - vehicules/id/:id\n\t\t(récupère une vehicule en fonction de son id)")
//         connection.query(query, (err, rows) => {
//             connection.release();
//             if(err) throw err;
//             res.json(rows);
//         });
//     });
// });


// GET by marque
// router.get('/marque/:marque', displayClientInfo, ensureToken, function(req, res, next) {
//     db.pool.getConnection((err, connection) => {
//         if(err) throw err;
//         let query = 'SELECT * from vehicules where marque = ?'
//         query = mysql.format(query,[req.params.marque]);
//         console.log("\tGET - vehicules/marque/:marque\n\t(récupère une/plusieurs vehicule(s) en fonction de son num. de marque)")
//         connection.query(query, (err, rows) => {
//             connection.release();
//             if(err) throw err;
//             res.json(rows);
//         });
//     });
// });

// GET nb vehicules
// router.get('/nb_vehicules', displayClientInfo, ensureToken, function(req, res, next) {
//     db.pool.getConnection((err, connection) => {
//         if(err) throw err;
//         let query = 'SELECT count(*) from vehicules'
//         console.log("\tGET - vehicules/nb_vehicules - nombre")
//         connection.query(query, (err, rows) => {
//             connection.release();
//             if(err) throw err;
//             res.json(rows[0]["count(*)"]);
//         });
//     });
// });



// GET nb vehicules par marque
// router.get('/nb_vehicules/marque/:marque', displayClientInfo, function(req, res, next) {
//     db.pool.getConnection((err, connection) => {
//         if(err) throw err;
//         let query = 'SELECT count(*) from vehicules where marque = ?'
//         query = mysql.format(query,[req.params.marque]);
//         console.log("\tGET - vehicules/nb_vehicules/marque/:marque - nombre")
//         connection.query(query, (err, rows) => {
//             connection.release();
//             if(err) throw err;
//             res.json(rows[0]["count(*)"]);
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
        let query = "SELECT * FROM vehicules where nom_unique = ?";
        query = mysql.format(query,[req.query.nom_unique]);

        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - vehicules/nomUnique (id_utilisateur: "+req.query.id_utilisateur+")\t\t(récupère vehicule via nom_unique)");
        console.log("\tGET - vehicules/nomUnique (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(récupère vehicule via nom_unique)")
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



// POST ajouter un nouveau véhicule
router.post('/', displayClientInfo, jsonParser, function(req, res, next) {
    let query = "";
    if(req.body.detail == undefined){
        query = 'INSERT INTO `vehicules`(`nom_unique`, `utilisateur`, `marque`, `type`) VALUES (?,?,(select marques.id_marque from marques where marques.nom_unique = ?), ?)';
        query = mysql.format(query,[req.body.nom_unique, req.body.id_utlisateur, req.body.marque, req.body.type]);
    }
    else{
        query = 'INSERT INTO `vehicules`(`nom_unique`, `utilisateur`, `marque`, `type`, `detail`) VALUES (?,?,(select marques.id_marque from marques where marques.nom_unique = ?), ?, ?)';
        query = mysql.format(query,[req.body.nom_unique, req.body.id_utlisateur, req.body.marque, req.body.type, req.body.detail]);
    }
    logger.info("\tPOST - vehicules/ (id_utilisateur: "+req.body.utilisateur+")\t\t(ajout d'un nouveau vehicule)");
    console.log("\tPOST - vehicules/ (id_utilisateur: "+req.body.utilisateur+")\n\t\t(ajout d'un nouveau vehicule)")
    pool.query(query,(err, response) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        // rows added
        logger.info("\t\tid nouveau vehicule => "+response.insertId);
        console.log("\t\tid nouveau vehicule => "+response.insertId);
        res.json({status: "OK"});
    });
});



// modifier un vehicule
router.put('/', displayClientInfo, ensureToken, jsonParser, function(req, res, next) {
    //UPDATE `vehicules` SET `marque` = (select id_marque from marques where nom_unique = 'Fiat') WHERE `vehicules`.`id_vehicule` = 11
    let query = "UPDATE ?? SET ?? = ?, ?? = ?, ?? = ?, ?? = (select id_marque from marques where nom_unique = ?) WHERE ?? = ?";
    query = mysql.format(query,["vehicules","nom_unique",req.body.nom_unique,"detail",req.body.detail,"type",req.body.type,"marque",req.body.marque,"id_vehicule",req.body.id_vehicule]);
    //console.log("QUERY "+query)
    logger.info("\tPUT - vehicules/ (id_utilisateur: "+req.body.id_utilisateur+")\t\t(modifier un vehicule)");
    console.log("\tPUT - vehicules/ (id_utilisateur: "+req.body.id_utilisateur+")\n\t\t(modifier un vehicule)");
    pool.query(query,(err, response) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        //console.log(response)
        res.json({status: "ok"});
    });
});

// supprimer un vehicule
router.delete('/', displayClientInfo, ensureToken, jsonParser, function(req, res, next) {
    let numbers = JSON.parse(req.query.ids);
    let alright = true;
    for(let i of numbers){
        let query = "DELETE FROM vehicules WHERE vehicules.id_vehicule = ?";
        query = mysql.format(query,[i]);
        //console.log("QUERY "+query)
        logger.info("\tDELETE - vehicules/ (id_utilisateur: "+req.query.id_utilisateur+")\t\t(supprimer un vehicule)");
        console.log("\tDELETE - vehicules/ (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(supprimer un vehicule)");
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


router.get('/utilisateur/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query = "SELECT vehicules.id_vehicule, vehicules.nom_unique, marques.nom_unique as marque, vehicules.detail, vehicules.type from vehicules inner join marques on marques.id_marque = vehicules.marque where vehicules.utilisateur = ? order by vehicules.id_vehicule ASC";
        query = mysql.format(query,[req.query.id_utilisateur]);
        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - vehicules/utilisateur (id_utilisateur: "+req.query.utilisateur+")\t\t(liste des vehicules avec nom des marques en fct de l'utilisateur)");
        console.log("\tGET - vehicules/utilisateur (id_utilisateur: "+req.query.utilisateur+")\n\t\t(liste des vehicules avec nom des marques en fct de l'utilisateur)");
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
            query = "SELECT vehicules.id_vehicule, vehicules.nom_unique, marques.nom_unique as marque, vehicules.detail, vehicules.type from vehicules inner join marques on marques.id_marque = vehicules.marque where vehicules.utilisateur = ? order by vehicules.id_vehicule ASC";
        }
        else{
            query = "SELECT vehicules.id_vehicule, vehicules.nom_unique, marques.nom_unique as marque, vehicules.detail, vehicules.type from vehicules inner join marques on marques.id_marque = vehicules.marque where vehicules.utilisateur = ? order by vehicules.id_vehicule DESC";
        }

        query = mysql.format(query,[req.query.id_utilisateur]);

        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - vehicules/utilisateur (id_utilisateur: "+req.query.utilisateur+")\t\t(liste des vehicules avec nom des marques - tri id)");
        console.log("\tGET - vehicules/utilisateur (id_utilisateur: "+req.query.utilisateur+")\n\t\t(liste des vehicules avec nom des marques - tri id)");
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

//nom_unique
router.get('/utilisateur/tri/nom_unique/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT vehicules.id_vehicule, vehicules.nom_unique, marques.nom_unique as marque, vehicules.detail, vehicules.type from vehicules inner join marques on marques.id_marque = vehicules.marque where vehicules.utilisateur = ? order by vehicules.nom_unique ASC";
        }
        else{
            query = "SELECT vehicules.id_vehicule, vehicules.nom_unique, marques.nom_unique as marque, vehicules.detail, vehicules.type from vehicules inner join marques on marques.id_marque = vehicules.marque where vehicules.utilisateur = ? order by vehicules.nom_unique DESC";
        }
        query = mysql.format(query,[req.query.id_utilisateur]);

        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - vehicules/utilisateur (id_utilisateur: "+req.query.utilisateur+")\t\t(liste des vehicules avec nom des marques - tri nom_unique)");
        console.log("\tGET - vehicules/utilisateur (id_utilisateur: "+req.query.utilisateur+")\n\t\t(liste des vehicules avec nom des marques - tri nom_unique)");
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

//marque
router.get('/utilisateur/tri/marque/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT vehicules.id_vehicule, vehicules.nom_unique, marques.nom_unique as marque, vehicules.detail, vehicules.type from vehicules inner join marques on marques.id_marque = vehicules.marque where vehicules.utilisateur = ? order by marques.nom_unique ASC";
        }
        else{
            query = "SELECT vehicules.id_vehicule, vehicules.nom_unique, marques.nom_unique as marque, vehicules.detail, vehicules.type from vehicules inner join marques on marques.id_marque = vehicules.marque where vehicules.utilisateur = ? order by marques.nom_unique DESC";
        }
        query = mysql.format(query,[req.query.id_utilisateur]);
        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - vehicules/utilisateur (id_utilisateur: "+req.query.utilisateur+")\t\t(liste des vehicules avec nom des marques - tri marque)");
        console.log("\tGET - vehicules/utilisateur (id_utilisateur: "+req.query.utilisateur+")\n\t\t(liste des vehicules avec nom des marques - tri marque)");
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

//type
router.get('/utilisateur/tri/type/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT vehicules.id_vehicule, vehicules.nom_unique, marques.nom_unique as marque, vehicules.detail, vehicules.type from vehicules inner join marques on marques.id_marque = vehicules.marque where vehicules.utilisateur = ? order by vehicules.type ASC";
        }
        else{
            query = "SELECT vehicules.id_vehicule, vehicules.nom_unique, marques.nom_unique as marque, vehicules.detail, vehicules.type from vehicules inner join marques on marques.id_marque = vehicules.marque where vehicules.utilisateur = ? order by vehicules.type DESC";
        }
        query = mysql.format(query,[req.query.id_utilisateur]);
        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - vehicules/utilisateur (id_utilisateur: "+req.query.utilisateur+")\t\t(liste des vehicules avec nom des marques - tri type)");
        console.log("\tGET - vehicules/utilisateur (id_utilisateur: "+req.query.utilisateur+")\n\t\t(liste des vehicules avec nom des marques - tri type)");
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

//détail
router.get('/utilisateur/tri/detail/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT vehicules.id_vehicule, vehicules.nom_unique, marques.nom_unique as marque, vehicules.detail, vehicules.type from vehicules inner join marques on marques.id_marque = vehicules.marque where vehicules.utilisateur = ? order by vehicules.detail ASC";
        }
        else{
            query = "SELECT vehicules.id_vehicule, vehicules.nom_unique, marques.nom_unique as marque, vehicules.detail, vehicules.type from vehicules inner join marques on marques.id_marque = vehicules.marque where vehicules.utilisateur = ? order by vehicules.detail DESC";
        }
        query = mysql.format(query,[req.query.id_utilisateur]);
        //console.log('connected as id ' + connection.threadId);
        logger.info("\tGET - vehicules/utilisateur (id_utilisateur: "+req.query.utilisateur+")\t\t(liste des vehicules avec nom des marques - tri detail)");
        console.log("\tGET - vehicules/utilisateur (id_utilisateur: "+req.query.utilisateur+")\n\t\t(liste des vehicules avec nom des marques - tri detail)");
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
