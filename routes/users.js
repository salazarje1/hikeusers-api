const express = require("express");
const { BadRequestError } = require("../expressError"); 
const User = require("../models/users"); 
const userNewSchema = require("../schemas/userNew.json"); 
const userAuthSchema = require("../schemas/userAuth.json"); 
const userUpdateSchema = require("../schemas/userUpdate.json"); 
const jsonschema = require("jsonschema"); 
const { createToken } = require("../helpers/tokens"); 
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/authCheck"); 


const router = express.Router(); 


/** POST /register
 * 
 * Authorization: None
 * 
 * 
 */

router.post('/register', async function (req, res, next) {
    try {
        const validator = jsonschema.validate(req.body, userNewSchema); 
         
        if(!validator.valid){
            const err = validator.errors.map(e => e.stack); 
            throw new BadRequestError(err); 
        }

        delete req.body.confirmPassword; 

        const newUser = await User.register({ ...req.body, isAdmin: false }); 
        const token = createToken(newUser);
        
        return res.status(201).json({ token }); 
    } catch(err) {
        return next(err); 
    }
})

/** POST /login
 * 
 * Authorization: None
 */

router.post('/login', async function (req, res, next) {
    try {
        const validate = jsonschema.validate(req.body, userAuthSchema); 
        if(!validate.valid){
            const errors = validate.errors.map(e => e.stack);
            throw new BadRequestError(errors); 
        }

        const { username, password } = req.body; 
        const user = await User.authenticate(username, password); 
        const token = createToken(user);
        return res.json({ token });
    } catch(err) {
        return next(err); 
    }
})

/** Get / gets all users
 * 
 * Authorization: admin
 */
router.get('/', ensureAdmin, async function (req, res, next) {
    try {
        const users = await User.findAll();
        return res.json({ users }); 
    } catch(err) {
        return next(err); 
    }
})

/** Get /user gets single user
 * 
 * Authorization: admin
 */
router.get('/user/:username', ensureCorrectUserOrAdmin, async function(req, res, next) {
    try {
        const user = await User.getUser(req.params.username); 
        return res.json({ user }); 
    } catch(err) {
        return next(err); 
    }
})



/** Get /[username] 
 * 
 * Authorization: admin
 */
router.get('/:username', ensureCorrectUserOrAdmin, async function(req, res, next) {
    try {
        const user = await User.get(req.params.username); 
        return res.json({ user }); 
    } catch(err) {
        return next(err); 
    }
})


/** Patch /[username]
 * 
 * Authorization: admin or user
 */
router.patch("/:username", ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, userUpdateSchema); 
        if(!validator.valid) {
            const errs = validator.errors.map(e => e.stack); 
            throw new BadRequestError(errs); 
        }

        const user = await User.update(req.params.username, req.body); 
        return res.json({ user }); 
    } catch(err) {
        return next(err); 
    }
})

/** Delete /[username]
 * 
 * Authorization: admin or user  
 */ 
router.delete("/:username", ensureCorrectUserOrAdmin, async (req, res, next) => {
    try{
        await User.remove(req.params.username); 
        return res.json({ deleted: req.params.username }); 
    } catch(err) {
        return next(err); 
    }
})

/** POST /[username]/hikes/[id]
 * 
 * Authorization: admin or user
 */

router.post("/:username/hikes", ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const username = req.params.username;  
        await User.addHikeToUser(username, req.body); 
        return res.json({ success: true })
    } catch(err) {
        return next(err); 
    }
})


/** DELETE /[username]/hikes
 * 
 * Authorization: admin or user
 */
router.delete("/:username/hikes/:hikeId", ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const hikeId = req.params.hikeId; 
        await User.deleteHikeToUser(hikeId); 
        return res.json({ success: true }); 
    } catch(err) {
        return next(err); 
    }
}) 


module.exports = router; 