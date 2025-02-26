const mysql = require("mysql2/promise");

require('dotenv').config({ path: './.env' }); 

const port = process.env.MYSQL_PORT; 
const host = process.env.DB_HOST;
const database = process.env.MYSQL_DATABASE;
const dbuser = process.env.MYSQL_ROOT_USER;
const dbPassword = process.env.MYSQL_ROOT_PASSWORD;

const db = mysql.createPool({
    host: host,
    database: database,
    user: dbuser,
    password: dbPassword,
    port: port
});

db.getConnection()
    .then(() => {
        console.log('✅ Connection done ..');
    })
    .catch((error) => {
        console.log(`❌ Error  ... .. ${error}, ${database}`);
    });

module.exports = db;