console.log("hello from utilisateurs.js");

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
    jwt,
    payload,
    tokenBlackList,
    privateKEY,
    publicKEY,
    signOptions,
    verifyOptions,
    displayClientInfo,
    ensureToken
} = require('../modules/variables/jwt');

const {
    bcrypt: bcrypt,
    saltRounds: saltRounds
} = require('../modules/variables/bcrypt');

const {
    logger: logger
} = require('../modules/variables/winston-logger');


// ROUTES àpd /utilisateurs/...

// GET *
router.get('/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err){
            logger.error(err);
            throw err;
        }
        logger.info("\tGET - utilisateurs (id_utilisateur: "+req.query.id_utilisateur+")");
        console.log("\tGET - utilisateurs (id_utilisateur: "+req.query.id_utilisateur+")");
        connection.query('SELECT * from utilisateurs', (err, rows) => {
            connection.release();
            if(err){
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});

// GET by id_utilisateur
router.get('/id/', displayClientInfo, ensureToken, function(req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) throw err;
        let query = 'SELECT * from utilisateurs where id_utilisateur = ?'
        query = mysql.format(query,[req.query.id_utilisateur]);
        logger.info("\tGET - utilisateurs/id/ (id_utilisateur: "+req.query.utilisateur+")");
        console.log("\tGET - utilisateurs/id/ (id_utilisateur: "+req.query.utilisateur+")");
        connection.query(query, (err, rows) => {
            connection.release();
            if(err){
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});


// GET by email
router.get('/email/:email', displayClientInfo, function(req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err){
            logger.error(err);
            throw err;
        }
        let query = 'SELECT * from utilisateurs where email = ?'
        query = mysql.format(query,[req.params.email]);
        logger.info("\tGET - utilisateurs/email:email");
        console.log("\tGET - utilisateurs/email:email");
        connection.query(query, (err, rows) => {
            connection.release();
            if(err){
                logger.error(err);
                throw err;
            }
            // le frontend n'a pas besoin du password
            if(rows.length != 0){
                delete rows[0]['password'];
            }
            res.json(rows);
        });
    });
});

// POST checker un mot de passe
router.post('/pass', displayClientInfo, jsonParser, function(req, res, next) {
    let query = 'SELECT password from utilisateurs where email = ?';
    query = mysql.format(query,[req.body.email]);
    logger.info("\tPOST - utilisateurs/pass\t\t(checker le mdp d'un utilisateur)");
    console.log("\tPOST - utilisateurs/pass\n\t\t(checker le mdp d'un utilisateur)");
    pool.query(query,(err, response) => {
        if(err) {
            logger.error(err)
            console.error(err);
            return;
        }
        bcrypt.compare(req.body.pass, response[0]['password'], function(err, result) {
            if(result){
                res.json({status: "OK"});
            }
            else{
                res.sendStatus(403);
            }
        });
    });
});

// POST ajouter un nouvel utilisateur
router.post('/', displayClientInfo, jsonParser, function(req, res, next) {
    let query = "";
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        if(err) return;
        if(req.body.age == undefined){
            query = 'INSERT INTO utilisateurs (email, password, nom, prenom) VALUES (?,?,?,?)';
            query = mysql.format(query,[req.body.email, hash, req.body.nom, req.body.prenom]);
        }
        else{
            query = 'INSERT INTO utilisateurs (email, password, nom, prenom, age) VALUES (?,?,?,?,?)';
            query = mysql.format(query,[req.body.email, hash, req.body.nom, req.body.prenom, req.body.age]);
        }
        logger.info("\tPOST - utilisateurs/\t\t(ajout d'un nouvel utilisateur)");
        console.log("\tPOST - utilisateurs/\n\t\t(ajout d'un nouvel utilisateur)");
        pool.query(query,(err, response) => {
            if(err) {
                logger.error(err);
                console.error(err);
                return;
            }
            logger.info("\t\tid nouvel utilisateur => "+response.insertId);
            console.log("\t\tid nouvel utilisateur => "+response.insertId);
            res.json({status: "OK"});
        });
    });
});



// PUT modifier un utilisateur
router.put('/', displayClientInfo, ensureToken, jsonParser, function(req, res, next) {
    let query;
    if(req.body.password == null){
        if(req.body.modifierAge == 0){
            query = "UPDATE ?? SET ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?";
            query = mysql.format(query,["utilisateurs","email",req.body.email,"nom",req.body.nom,"prenom",req.body.prenom,"nbKilometresCumules",req.body.nbKilometresCumules,"estConnecte",req.body.estConnecte,"estAdmin",req.body.estAdmin,"id_utilisateur",req.body.id_utilisateur]);
        }
        else{
            query = "UPDATE ?? SET ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?";
            query = mysql.format(query,["utilisateurs","email",req.body.email,"nom",req.body.nom,"prenom",req.body.prenom,"age",req.body.age,"nbKilometresCumules",req.body.nbKilometresCumules,"estConnecte",req.body.estConnecte,"estAdmin",req.body.estAdmin,"id_utilisateur",req.body.id_utilisateur]);
        }
        logger.info("\tPUT - utilisateurs/ (id_utilisateur: "+req.body.utilisateur+")\t\t(modifier un utilisateur)");
        console.log("\tPUT - utilisateurs/ (id_utilisateur: "+req.body.utilisateur+")\n\t\t(modifier un utilisateur)");
        pool.query(query,(err, response) => {
            if(err){
                logger.error(err);
                console.error(err);
                return;
            }
            res.json({status: "OK"});
        });
    }
    else{
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            if(err) return;
            if(req.body.modifierAge == 0){
                query = "UPDATE ?? SET ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?";
                query = mysql.format(query,["utilisateurs","email",req.body.email,"password",hash,"nom",req.body.nom,"prenom",req.body.prenom,"nbKilometresCumules",req.body.nbKilometresCumules,"estConnecte",req.body.estConnecte,"estAdmin",req.body.estAdmin,"id_utilisateur",req.body.id_utilisateur]);
            }
            else{
                query = "UPDATE ?? SET ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?";
                query = mysql.format(query,["utilisateurs","email",req.body.email,"password",hash,"nom",req.body.nom,"prenom",req.body.prenom,"age",req.body.age,"nbKilometresCumules",req.body.nbKilometresCumules,"estConnecte",req.body.estConnecte,"estAdmin",req.body.estAdmin,"id_utilisateur",req.body.id_utilisateur]);
            }
            logger.info("\tPUT - utilisateurs/ (id_utilisateur: "+req.body.utilisateur+")\t\t(modifier un utilisateur)");
            console.log("\tPUT - utilisateurs/ (id_utilisateur: "+req.body.utilisateur+")\n\t\t(modifier un utilisateur)");
            pool.query(query,(err, response) => {
                if(err) {
                    logger.error(err);
                    console.error(err);
                    return;
                }
                res.json({status: "OK"});
            });
        });
    }
});

// PUT recalculer le nombre de kilometres Cumules d'un utilisateur
router.put('/nbKilometresCumules', displayClientInfo, ensureToken, jsonParser, function(req, res, next) {
    let query = "UPDATE utilisateurs SET nbKilometresCumules = (select sum(lignes.nbKilometres) from lignes, vehicules where lignes.vehicule = vehicules.id_vehicule and vehicules.utilisateur = ?) where id_utilisateur = ?";
    query = mysql.format(query,[req.body.id_utilisateur,req.body.id_utilisateur]);
    logger.info("\tPUT - utilisateurs/nbKilometresCumules (id_utilisateur: "+req.body.utilisateur+")\t\t(recalculer le nombre de kilometres Cumules d'un utilisateur)");
    console.log("\tPUT - utilisateurs/nbKilometresCumules (id_utilisateur: "+req.body.utilisateur+")\n\t\t(recalculer le nombre de kilometres Cumules d'un utilisateur)");
    pool.query(query,(err, response) => {
        if(err) {
            logger.error(err);
            console.error(err);
            return;
        }
        res.json({status: "OK"});
    });
});





// connecter/déconnecter un utilisateur
router.post('/connexion', displayClientInfo, jsonParser, function(req, res, next){
    let query = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
    query = mysql.format(query,["utilisateurs","estConnecte",req.body.estConnecte,"utilisateurs.email",req.body.email]);
    let status;
    req.body.estConnecte? status="connexion":status="déconnexion";
    logger.info("\tPOST - utilisateurs/connexion (email utilisateur:"+req.body.email+") "+status);
    console.log("\tPOST - utilisateurs/connexion (email utilisateur:"+req.body.email+") "+status);
    pool.query(query,(err, response) => {
        if(err){
            logger.error(err);
            console.error(err);
            return;
        }
    }); 
    //connexion
    if(req.body.estConnecte == 1){
        //const utilisateur = {email: req.body.email, password: req.body.password};
        //const token = jwt.sign({utilisateur}, secret);
        payload['id_utilisateur'] = req.body.id_utilisateur;
        let token = jwt.sign(payload, privateKEY, signOptions);

        res.json({token: token});
    }
    //déconnexion
    else{
        tokenBlackList.push(req.body.token);
        res.json({status: "OK"});
    }
});


// vérifier le token d'un utilisateur
router.post('/connexion/token', displayClientInfo, jsonParser, function(req, res, next){
    logger.info("\tjwt - POST - utilisateurs/connexion/token ");
    console.log("\tjwt - POST - utilisateurs/connexion/token");
    if(!tokenBlackList.includes(req.body.token)){
        //jwt.verify(req.body.token, secret, function(err, data){
        jwt.verify(req.body.token, publicKEY, verifyOptions, function(err, data){
            if(err){
                //console.log(err)
                //console.log(jwt.decode(req.body.token)['id_utilisateur'])
                //déconnecter l'utilisateur dans la db
                let query = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
                query = mysql.format(query,["utilisateurs","estConnecte",0,"utilisateurs.id_utilisateur",jwt.decode(req.body.token)['id_utilisateur']]);
                logger.info("\tPOST - utilisateurs/déconnexion (id_utilisateur: "+jwt.decode(req.body.token)['id_utilisateur']+")");
                console.log("\tPOST - utilisateurs/déconnexion (id_utilisateur: "+jwt.decode(req.body.token)['id_utilisateur']+")");
                pool.query(query,(err, response) => {
                    if(err) {
                        logger.error(err);
                        console.error(err);
                        return;
                    }
                    res.sendStatus(403);
                }); 
            }
            else{
                // permet de déconnecter un utilisateur à distance depuis un compte administrateur
                db.pool.getConnection((err, connection) => {
                    if(err) {
                        logger.error(err);
                        throw err;
                    }
                    let query = 'SELECT utilisateurs.estConnecte from utilisateurs where utilisateurs.id_utilisateur = ?'
                    query = mysql.format(query,[data['id_utilisateur']]);
                    logger.info("\tGET - utilisateurs/ (id_utilisateur: "+data['id_utilisateur']+")(estConnecte status)");
                    console.log("\tGET - utilisateurs/ (id_utilisateur: "+data['id_utilisateur']+")(estConnecte status)");
                    connection.query(query, (err, rows) => {
                        connection.release();
                        if(err) {
                            logger.error(err);
                            throw err;
                        }
                        if(rows[0]['estConnecte'] == 1){
                            // donner un nouveau token valide pour raffraichir le temps de connexion
                            // pour une raison inconnue, le RSA ne change pas de token avec une nouvelle signature tant que le payload n'a pas un changement de valeur
                            // if(payload['data1'] == secret1){
                            //     payload['data1'] = secret2;
                            // }
                            // else{
                            //     payload['data1'] = secret1;
                            // }
                            payload['data1'] = Math.random();
                            payload['id_utilisateur'] = data['id_utilisateur'];
                            let newToken = jwt.sign(payload, privateKEY, signOptions);

                            // eviter de remplir à ras-bord
                            if(tokenBlackList.length == 1000){
                                tokenBlackList = tokenBlackList.slice(tokenBlackList.length - 500, 1000);
                            }

                            // et jeter celui encore valide dans l'array des token plus valides
                            tokenBlackList.push(req.body.token);
                            db.pool.getConnection((err, connection) => {
                                if(err) {
                                    logger.error(err);
                                    throw err;
                                }
                                let query = 'SELECT * from utilisateurs where id_utilisateur = ?'
                                query = mysql.format(query,[data['id_utilisateur']]);
                                logger.info("\tGET - utilisateurs/ (id_utilisateur: "+data['id_utilisateur']+")");
                                console.log("\tGET - utilisateurs/ (id_utilisateur: "+data['id_utilisateur']+")");
                                connection.query(query, (err, rows) => {
                                    connection.release();
                                    if(err) {
                                        logger.error(err);
                                        throw err;
                                    }
                                    res.json({user: rows, newToken: newToken});
                                });
                            });
                        }
                        else{
                            res.sendStatus(403);
                        }
                    });
                });
            }
        });
    }
    else{
        res.sendStatus(403);
    }
});

// supprimer un utilisateur
router.delete('/', displayClientInfo, ensureToken, jsonParser, function(req, res, next) {
    let numbers = JSON.parse(req.query.ids);
    let alright = true;
    for(let i of numbers){
        let query = "DELETE FROM utilisateurs WHERE utilisateurs.id_utilisateur = ?";
        query = mysql.format(query,[i]);
        logger.info("\tDELETE - utilisateurs/ (id_utilisateur: "+req.query.id_utilisateur+")\t\t(supprimer un utilisateur)");
        console.log("\tDELETE - utilisateurs/ (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(supprimer un utilisateur)");
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


// TRI
// id
router.get('/tri/id/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT * FROM utilisateurs order by id_utilisateur ASC";
        }
        else{
            query = "SELECT * FROM utilisateurs order by id_utilisateur DESC";
        }
        logger.info("\tGET - utilisateurs/tri/id/' (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des utilisateurs - tri id)");
        console.log("\tGET - utilisateurs/tri/id/' (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des utilisateurs - tri id)");
        connection.query(query, (err, rows) => {
            connection.release();
            if(err) {
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});

// email
router.get('/tri/email/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT * FROM utilisateurs order by email ASC";
        }
        else{
            query = "SELECT * FROM utilisateurs order by email DESC";
        }
        logger.info("\tGET - utilisateurs/tri/email/ (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des utilisateurs - tri email)");
        console.log("\tGET - utilisateurs/tri/email/ (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des utilisateurs - tri email)");
        connection.query(query, (err, rows) => {
            connection.release();
            if(err) {
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});

// nom
router.get('/tri/nom/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT * FROM utilisateurs order by nom ASC";
        }
        else{
            query = "SELECT * FROM utilisateurs order by nom DESC";
        }
        logger.info("\tGET - utilisateurs/tri/nom/ (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des utilisateurs - tri nom)");
        console.log("\tGET - utilisateurs/tri/nom/ (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des utilisateurs - tri nom)");
        connection.query(query, (err, rows) => {
            connection.release();
            if(err) {
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});

// prenom
router.get('/tri/prenom/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT * FROM utilisateurs order by prenom ASC";
        }
        else{
            query = "SELECT * FROM utilisateurs order by prenom DESC";
        }
        logger.info("\tGET - utilisateurs/tri/prenom/ (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des utilisateurs - tri prenom)");
        console.log("\tGET - utilisateurs/tri/prenom/ (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des utilisateurs - tri prenom)");
        connection.query(query, (err, rows) => {
            connection.release();
            if(err) {
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});

// age
router.get('/tri/age/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT * FROM utilisateurs order by age ASC";
        }
        else{
            query = "SELECT * FROM utilisateurs order by age DESC";
        }
        logger.info("\tGET - utilisateurs/tri/age/ (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des utilisateurs - tri age)");
        console.log("\tGET - utilisateurs/tri/age/ (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des utilisateurs - tri age)");
        connection.query(query, (err, rows) => {
            connection.release();
            if(err) {
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});

// nbKilometresCumules
router.get('/tri/nbKilometresCumules/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT * FROM utilisateurs order by nbKilometresCumules ASC";
        }
        else{
            query = "SELECT * FROM utilisateurs order by nbKilometresCumules DESC";
        }
        logger.info("\tGET - utilisateurs/tri/nbKilometresCumules/ (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des utilisateurs - tri nbKilometresCumules)");
        console.log("\tGET - utilisateurs/tri/nbKilometresCumules/ (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des utilisateurs - tri nbKilometresCumules)");
        connection.query(query, (err, rows) => {
            connection.release();
            if(err) {
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});

// estConnecte
router.get('/tri/estConnecte/', displayClientInfo, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT * FROM utilisateurs order by estConnecte ASC";
        }
        else{
            query = "SELECT * FROM utilisateurs order by estConnecte DESC";
        }
        logger.info("\tGET - utilisateurs/tri/estConnecte/ (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des utilisateurs - tri estConnecte)");
        console.log("\tGET - utilisateurs/tri/estConnecte/ (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des utilisateurs - tri estConnecte)");
        connection.query(query, (err, rows) => {
            connection.release();
            if(err) {
                logger.error(err);
                throw err;
            }
            res.json(rows);
        });
    });
});

// estAdmin
router.get('/tri/estAdmin/', displayClientInfo, ensureToken, function (req, res, next) {
    db.pool.getConnection((err, connection) => {
        if(err) {
            logger.error(err);
            throw err;
        }
        let query;
        if(req.query.type == 'ASC'){
            query = "SELECT * FROM utilisateurs order by estAdmin ASC";
        }
        else{
            query = "SELECT * FROM utilisateurs order by estAdmin DESC";
        }
        logger.info("\tGET - utilisateurs/tri/estAdmin/ (id_utilisateur: "+req.query.id_utilisateur+")\t\t(liste des utilisateurs - tri estAdmin)");
        console.log("\tGET - utilisateurs/tri/estAdmin/ (id_utilisateur: "+req.query.id_utilisateur+")\n\t\t(liste des utilisateurs - tri estAdmin)");
        connection.query(query, (err, rows) => {
            connection.release();
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
