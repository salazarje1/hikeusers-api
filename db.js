const { Client } = require("pg"); 
const { getDatabaseUri } = require('./config'); 

let db; 

if (process.env.NODE_ENV === "production"){
    db = new Client({
        connectionString: getDatabaseUri(),
        ssl: {
            rejectUnauthorized: false
        }
    }); 
} else {
    db = new Client({
        host: 'localhost',
        user: 'salazar',
        port: 5432,
        password: 'admin',
        database: getDatabaseUri()
    })
}

db.connect();

module.exports = db; 