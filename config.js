require('dotenv').config(); 
require('colors'); 

const SECRET_KEY = process.env.SECRET_KEY || 'secret-dev'; 

const PORT = +process.env.PORT || 3001; 


// Database
function getDatabaseUri() {
    return (process.env.NODE_ENV === 'test') ?
    "hikeusers_test" : 
    process.env.DATABASE_URL || "hikeusers"
}

// bcrypt speed
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12; 


module.exports = {
    SECRET_KEY, PORT, getDatabaseUri, BCRYPT_WORK_FACTOR
}