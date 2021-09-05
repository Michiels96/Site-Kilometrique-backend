var winston = require('winston');
require('winston-daily-rotate-file');

const timezoned = () => {
  let date = new Date().toLocaleString('fr-BE', {
    year: "numeric", month: "numeric", day: "numeric", 
    hour: "numeric", minute: "numeric", second: "numeric",
    timeZone: 'Europe/Brussels'
  });
  return date
}

const myformat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({format: timezoned}),
    winston.format.printf(info => `${info.timestamp}: ${info.message}`),
    winston.format.printf(error => `${error.timestamp}: ${error.message}`)
  );

var transport = new winston.transports.DailyRotateFile({
    filename: 'log-SiteKilometrique-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    dirname: './logs/',
    zippedArchive: false,
    maxSize: '20m',
    //maxFiles: '14d'
    format: myformat,
    //tous les 8h, un nouveau fichier
    frequency: '8h'
});

var logger = winston.createLogger({
  transports: [
    transport
  ]
});

module.exports = {
    logger: logger
};