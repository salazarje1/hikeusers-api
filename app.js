const express = require('express');
const cors = require('cors'); 

const morgan = require('morgan'); 
const { NotFoundError } = require('./expressError');
const usersRoutes = require("./routes/users"); 
const { authenticateToken } = require("./middleware/authCheck"); 

const app = express(); 



app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateToken); 


app.use("/users", usersRoutes); 


// Handle 404 errors
app.use(function(req, res, next) {
    return next(new NotFoundError()); 
})



// Generic Error
app.use(function(err, req, res, next){
    if(process.env.NODE_ENV !== 'test') console.log(err.stack); 
    const status = err.status || 500;
    const message = err.message;


    return res.status(status).json({
        error: { message, status },
    })
});

module.exports = app; 