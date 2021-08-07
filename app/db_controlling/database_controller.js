const mySQLController = require('mysql');
const config = require('../config/db.config.json');

var database = mySQLController.createConnection(
    {
        host: config.env.SERVER,
        user: config.env.USERNAME,
        database: config.env.NAME,
        password: config.env.PASSWORD
    }
);

database.connect((error) => {
    if (error) throw error;
    else {
         console.log('Connected !');
    }
});


module.exports = database;
