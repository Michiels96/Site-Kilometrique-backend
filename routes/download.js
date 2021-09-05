console.log("hello from download.js");

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

var path = require("path");
var fs = require('fs');


// ROUTES àpd /download/...

function createFile(body, fileName){
    var dir = './fichiers/utilisateur'+body.id_utilisateur;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    dir += "/";
    return new Promise((resolve, reject) => {
        db.pool.getConnection((err, connection) => {
            if(err) {
                logger.error(err);
                throw err;
            }
            var content = "";
            var content2 = "";
            var content3 = "";
            if(body.historique){
                content = "";
                content += "Historique de navigation :";
                let query = "SELECT lignes.id_ligne, vehicules.nom_unique as vehicule, lignes.nbKilometres, lignes.nbKilometresCumules, lignes.description, lignes.date from lignes inner join vehicules on vehicules.id_vehicule = lignes.vehicule where vehicules.utilisateur = ? order by lignes.nbKilometresCumules ASC";
                query = mysql.format(query,[body.id_utilisateur]);
                //console.log('connected as id ' + connection.threadId);
                logger.info("\tGET - lignes/utilisateur (id_utilisateur: "+body.id_utilisateur+")\t\t(liste des lignes avec nom des véhicules en fct de l'utilisateur)");
                console.log("\tGET - lignes/utilisateur (id_utilisateur: "+body.id_utilisateur+")\n\t\t(liste des lignes avec nom des véhicules en fct de l'utilisateur)");
                connection.query(query, (err, rows) => {
                    if(err) {
                        logger.error(err);
                        throw err;
                    }
                    //console.log(rows.length);
                    var vehiculePrecedent = "";
                    for(let i of rows){
                        //console.log(i.id_ligne)
                        
                        var date = i.date;
                        let year = date.getFullYear();
                        let month = (date.getMonth()+1)+"";
                        let day = (date.getDate()-1)+"";
                        if(month.length == 1){
                            month = "0"+month;
                        }
                        if(day.length == 1){
                            day = "0"+day;
                        }
                        if(vehiculePrecedent != i.vehicule){
                            content += "\n"+i.vehicule+"\n";
                            vehiculePrecedent = i.vehicule;
                        }
                        content += i.nbKilometresCumules+"km "+day+"."+month+"."+year+" "+i.description+"\n";
                    }
                    content += "\n";
                    fs.appendFile(dir+fileName, content, function(err) {
                        if(err){
                            return console.error(err);
                        }
                        if(!body.vehicules && !body.statistiques){
                            connection.release(); // return the connection to pool
                            resolve(content);
                            return;
                        }
                    });
                    //res.json(rows);
                });
            }
            if(body.vehicules){
                content2 = "";
                let query = "SELECT vehicules.id_vehicule, vehicules.nom_unique, marques.nom_unique as marque, vehicules.detail, vehicules.type from vehicules inner join marques on marques.id_marque = vehicules.marque where vehicules.utilisateur = ? order by vehicules.id_vehicule ASC";
                query = mysql.format(query,[body.id_utilisateur]);
                //console.log('connected as id ' + connection.threadId);
                logger.info("\tGET - vehicules/utilisateur (id_utilisateur: "+body.id_utilisateur+")\t\t(liste des vehicules avec nom des marques en fct de l'utilisateur)");
                console.log("\tGET - vehicules/utilisateur (id_utilisateur: "+body.id_utilisateur+")\n\t\t(liste des vehicules avec nom des marques en fct de l'utilisateur)");
                connection.query(query, (err, rows) => {
                    if(err) {
                        logger.error(err);
                        throw err;
                    }
                    content2 += "Véhicules ("+rows.length+")\n";
                    for(let i of rows){
                        content2 += "nom: "+i.nom_unique+" - marque: "+i.marque+" - detail: "+i.detail+" - type: "+i.type+"\n";
                    }
                    content2 += "\n";
                    fs.appendFile(dir+fileName, content2, function(err) {
                        if(err){
                            return console.error(err);
                        }
                        if(!body.statistiques){
                            connection.release(); // return the connection to pool
                            content += content2;
                            resolve(content);
                            return;
                        }
                    });
                    //res.json(rows);
                });
            }
            if(body.statistiques){
                content3 = "";
                let query = "SELECT statistiques.id_statistique, statistiques.utilisateur, statistiques.description, statistiques.dateDAjout, statistiques.dateDeModification from statistiques where statistiques.utilisateur = ? order by statistiques.dateDAjout DESC";
                query = mysql.format(query,[body.id_utilisateur]);
                //console.log('connected as id ' + connection.threadId);
                logger.info("\tGET - statistiques/utilisateur (id_utilisateur: "+body.id_utilisateur+")\t\t(liste des statistiques en fct de l'utilisateur)");
                console.log("\tGET - statistiques/utilisateur (id_utilisateur: "+body.id_utilisateur+")\n\t\t(liste des statistiques en fct de l'utilisateur)");
                connection.query(query, (err, rows) => {
                    connection.release(); // return the connection to pool
                    if(err){
                        logger.error(err);
                        throw err;
                    }
                    content3 += "Statistiques ("+rows.length+")\n";
                    for(let i of rows){
                        var date = i.dateDAjout;
                        let year = date.getFullYear();
                        let month = (date.getMonth()+1)+"";
                        let day = (date.getDate()-1)+"";
                        if(month.length == 1){
                            month = "0"+month;
                        }
                        if(day.length == 1){
                            day = "0"+day;
                        }
                        content3 += day+"."+month+"."+year+" "+i.description+"\n";
                    }
                    content3 += "\n";
                    fs.appendFile(dir+fileName, content3, function(err) {
                        if(err){
                            return console.error(err);
                        }
                        content += content2;
                        content += content3;
                        resolve(content);
                    });
                    //res.json(rows);
                });
            }
            
        });
    });
}

// POST download
router.post('/', displayClientInfo, ensureToken, jsonParser, function(req, res, next) {
    logger.info("\tPOST - download (id_utilisateur: "+req.body.utilisateur+")\t\t(télécharger fichier de l'utilisateur "+req.body.id_utilisateur+")");
    console.log("\tPOST - download (id_utilisateur: "+req.body.utilisateur+")\n\t\t(télécharger fichier de l'utilisateur "+req.body.id_utilisateur+")");
    var date = new Date();
    let year = date.getFullYear();
    let month = (date.getMonth()+1)+"";
    let day = (date.getDate()-1)+"";
    let hour = (date.getHours())+"";
    let minute = (date.getMinutes())+"";
    let second = (date.getSeconds())+"";
    if(month.length == 1){
        month = "0"+month;
    }
    if(day.length == 1){
        day = "0"+day;
    }
    if(hour.length == 1){
        hour = "0"+hour;
    }
    if(minute.length == 1){
        minute = "0"+minute;
    }
    if(second.length == 1){
        second = "0"+second;
    }
    fileName = year+"."+month+"."+day+"-"+hour+":"+minute+":"+second+"--utilisateur-"+req.body.id_utilisateur+".txt";
    createFile(req.body, fileName).then((val) => {
        //filepath = path.join(__dirname,'../fichiers')+'/utilisateur'+req.body.id_utilisateur+'/'+fileName;
        //res.sendFile(filepath);
        res.json(val);
    });
});

/**
 * Exports
 */
module.exports = router