const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config"); 
const { UnauthorizedError } = require("../expressError"); 


function authenticateToken(req, res, next) {
    try {
        // console.log(req.headers, "**"); 
        const authToken = req.headers && req.headers.authorization;
        res.locals.user = false; 
        if(authToken) {
            const token = req.headers.authorization;  
            res.locals.user = jwt.verify(token, SECRET_KEY); 
        }
        return next();
    } catch (err) {
        return next(); 
    }
}

function ensureCorrectUserOrAdmin(req, res, next) {
    try {
        const user = res.locals.user;
        console.log(user); 
        if(!(user && (user.isAmin || user.username === req.params.username))) {
            throw new UnauthorizedError(); 
        }
        return next(); 
    } catch(err) {
        return next(err); 
    }
}


function ensureAdmin(req, res, next) {
    try {
        if(!res.locals.user && !res.locals.user.isAdmin) {
            throw new UnauthorizedError(); 
        }
        return next();
    } catch(err) {
        return next(err); 
    }
}




module.exports = {
    authenticateToken, 
    ensureCorrectUserOrAdmin,
    ensureAdmin
}