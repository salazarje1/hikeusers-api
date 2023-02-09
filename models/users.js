const db = require('../db'); 
const bcrypt = require('bcrypt'); 
const { NotFoundError, BadRequestError, UnauthorizedError } = require('../expressError'); 
const { BCRYPT_WORK_FACTOR } = require("../config.js"); 

const { partialUpdate } = require('../helpers/sqlUpdate'); 

class User {
    /** Find All users
     * 
     * return all user
     */

    static async findAll() {
        const result = await db.query(
            `Select username, first_name As "firstName", last_name As "lastName", email, is_admin As "isAdmin"
            From users Order By username`, 
        );
        return result.rows; 
    }

    /** Get user with username, returns user
     * 
     * Throws error if no user is found 
     */

    static async getUser(username) {
        const userRes = await db.query(
            `Select username, first_name As "firstName", last_name As "lastName", email, is_admin As "isAdmin"
            From users Where username = $1`,
            [username],
        );

        const user = userRes.rows[0]; 
        if(!user) throw new NotFoundError(`No user: ${username}`); 

        return user; 
    }

    /** Given a username, returns user
     * 
     * Throws error if no user is found
     */

    static async get(username) {
        const userRes = await db.query(
            `Select username, first_name As "firstName", last_name As "lastName", email, is_admin As "isAdmin"
            From users Where username = $1`,
            [username],
        );

        const user = userRes.rows[0]; 
        if(!user) throw new NotFoundError(`No user: ${username}`); 

        const userHikesRes = await db.query(
            `Select h.hike_id, h.hike_name
            From usersHikes as h
            Where h.user_id = $1`, [username]
        ); 

        if(userHikesRes.rows) {
            user.hikes = userHikesRes.rows;
            user.hikesArray = userHikesRes.rows.map(h => h.hike_id); 
        }


        return user; 
    }

    
    /** Register user
     * 
     * Returns { username, firstName, lastName, email, isAdmin }
     * 
     */
    static async register({ username, password, firstName, lastName, email, isAdmin }) { 
        
        const duplicateCheck = await db.query(
            `Select username From users Where username=$1`, [username],
        ); 

        if(duplicateCheck.rows[0]) {
            throw new BadRequestError(`Duplicate username: ${username}`); 
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

        const result = await db.query(
            `Insert Into users (username, password, first_name, last_name, email, is_admin)
            Values ($1, $2, $3, $4, $5, $6)
            Returning username, first_name As "firstName", last_name As "lastName", email, is_admin As "isAdmin"`, 
            [username, hashedPassword, firstName, lastName, email, isAdmin], 
        ); 
        const user = result.rows[0];
        return user; 
    }

    /** Login User
     * 
     *  Return { token } 
     */
    static async authenticate(username, password) {
        const result = await db.query(
            `Select username,
            password,
            first_name As "firstName",
            last_name As "lastName",
            email,
            is_admin As "isAdmin"
            From users
            Where username = $1`,
            [username],
        );

        const user = result.rows[0]; 

        if(user) {
            const isValid = await bcrypt.compare(password, user.password);
            if(isValid === true) {
                delete user.password;
                return user; 
            }
        }

        throw new UnauthorizedError("Invalid username/password"); 
    }



    /** Update user
     * 
     * Returns { ...user }
     */
    static async update(username, data) {
        if(data.password) {
            delete data.password; 
        }

        const { setCols, values } = partialUpdate(
            data, 
            {
                firstName: "first_name",
                lastName: "last_name",
                isAdmin: "is_admin",
            }
        );

        const usernameVarIdx = "$" + (values.length + 1); 

        const querySql = `Update users Set ${setCols}
                            Where username = ${usernameVarIdx}
                            Returning username, first_name as "firstName", last_name As "lastName", email, is_admin As "isAdmin"
                            `; 

        const result = await db.query(querySql, [...values, username]); 
        const user = result.rows[0]; 

        if(!user) throw new NotFoundError(`No user: ${username}`); 

        delete user.password;
        return user; 
    }


    /** Delete user
     * 
     * Returns nothing
     */
    static async remove(username) {
        let result = await db.query(
            ` Delete From users Where username = $1 Returning username`,
            [username],
        );
        console.log(result);
        const user = result.rows[0]; 

        if(!user) throw new NotFoundError(`No user: ${username}`); 
    }


    /** Add hike to user
     * 
     * Return nothing
     */
    static async addHikeToUser(username, hike) {
        const check = await db.query(
            `Select username
            From users Where username = $1`, [username]
        ); 
        const user = check.rows[0]; 

        if(!user) throw new NotFoundError(`No user: ${username}`)
        console.log('usehike', hike.id); 

        await db.query(
            `Insert Into usersHikes (user_id, hike_id, hike_name)
            Values ($1, $2, $3) Returning hike_id, hike_name`, [user.username, hike.id, hike.name]
        ); 
    }

    /** Delete hike to user
     * 
     * Return nothing
     */
    static async deleteHikeToUser(hikeId) {
        let result = await db.query(
            `Delete From usersHikes Where hike_id = $1`, [hikeId]
        ); 
        
    }
}

module.exports = User; 