const bcrypt = require('bcrypt');
//const saltRounds = process.env.BCRYPT_SALT;
const saltRounds = 10;



module.exports = {
    bcrypt: bcrypt,
    saltRounds: saltRounds
}

