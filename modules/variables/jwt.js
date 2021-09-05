var jwt = require('jsonwebtoken');
const fs = require('fs');
// const secret1 = process.env.JWT_SECRET1;
// const secret2 = process.env.JWT_SECRET2;
const secret = Math.random();
const totalTokenTime = "3h";

const {
    mysql,
    db
} = require('../variables/common');

var tokenBlackList = [];

var payload = {
    data1: secret,
};

var privateKEY  = fs.readFileSync('./modules/RSA/private.key', 'utf8');
var publicKEY  = fs.readFileSync('./modules/RSA/public.key', 'utf8');

var i  = 'Michiels';          // Issuer 
var s  = 'pierre@michiels.com';        // Subject 
var a  = 'http://siteKilometrique'; // Audience


var signOptions = {
    issuer:  i,
    subject:  s,
    audience:  a,
    //expiresIn:  "12h",
    //expiresIn: 30,
    expiresIn: totalTokenTime,
    algorithm:  "RS256"
};

var verifyOptions = {
    issuer:  i,
    subject:  s,
    audience:  a,
    //expiresIn:  "12h",
    expiresIn: totalTokenTime,
    algorithm:  ["RS256"]
};

const {
    logger: logger
} = require('./winston-logger');

function displayClientInfo(req, res, next){
    let date_ob = new Date();
    let date_jour = ("0" + date_ob.getDate()).slice(-2);
    let date_mois = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let date_annee = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    logger.info(req.socket.remoteAddress+" tente :");
    console.log(req.socket.remoteAddress+" tente ("+date_jour+"/"+date_mois+"/"+date_annee+" - "+hours+":"+minutes+":"+seconds+") :");
    next();
}

function ensureToken(req, res, next){
    const bearerHeader = req.headers["authorization"];
    if(typeof bearerHeader !== 'undefined'){
        req.token = bearerHeader;
        if(tokenBlackList.includes(req.token)){
            res.sendStatus(403);
        }
        else{
            //jwt.verify(req.token, secret, function(err, data){
            jwt.verify(req.token, publicKEY, verifyOptions, function(err, data){
                if(err){
                    db.pool.getConnection((err, connection) => {
                        if(err){
                            logger.error(err);
                            throw err;
                        }
                        let query = "UPDATE ?? SET ?? = ? WHERE ?? = ?";
                        query = mysql.format(query,["utilisateurs","estConnecte",0,"utilisateurs.id_utilisateur",jwt.decode(req.token)['id_utilisateur']]);
                        logger.info("\tPOST - utilisateurs/déconnexion");
                        console.log("\tPOST - utilisateurs/déconnexion")
                        connection.query(query, (err, rows) => {
                            connection.release();
                            if(err){
                                logger.error(err);
                                throw err;
                            }
                            res.sendStatus(403);
                        });
                    });
                }
                else{
                    next();
                }
            });
        }
    }
    else{
        res.sendStatus(403);
    }
}

module.exports = {
    jwt: jwt,
    fs: fs,
    secret: secret,
    tokenBlackList: tokenBlackList,
    payload: payload,
    privateKEY: privateKEY,
    publicKEY: publicKEY,
    signOptions: signOptions,
    verifyOptions: verifyOptions,
    displayClientInfo: displayClientInfo,
    ensureToken: ensureToken
}
