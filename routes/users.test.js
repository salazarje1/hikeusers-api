const request = require("supertest"); 

const db = require("../db.js"); 
const app = require("../app"); 
const User = require("../models/users"); 
const { createToken } = require("../helpers/tokens.js");

beforeAll(async () => {
    await db.query("Delete from users"); 


    await User.register({
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@test.com",
        password: "password1", 
        isAdmin: false
    })

    await User.register({
        username: "u2",
        firstName: "U2F",
        lastName: "U2L",
        email: "user2@test.com",
        password: "password2", 
        isAdmin: false
    })

    await User.register({
        username: "u3",
        firstName: "U3F",
        lastName: "U3L",
        email: "user3@test.com",
        password: "password3", 
        isAdmin: true
    })

}); 

const token = createToken({ username: 'u1', isAdmin: false });
const admintoken = createToken({ username: 'u3', isAdmin: true }); 

beforeEach(async () => {
    await db.query("Begin"); 
});

afterEach(async () => {
    await db.query("Rollback"); 
});

afterAll(async () => {
    await db.end(); 
}); 


describe("POST /users", function() {
    test("create new user", async function() {
        const resp = await request(app)
            .post("/users/register")
            .send({
                username: "new-user",
                firstName: "New",
                lastName: "User",
                password: "new-password",
                confirmPassword:"new-password",
                email: "newUser@test.com"
            })

        expect(resp.statusCode).toEqual(201); 
        expect(resp.body).toEqual({
            token: expect.any(String)
        })
    })
})

describe("GET /users", function() {
    test("Getting users works", async function () {
        const resp = await request(app)
            .get("/users")
            .set("authorization", admintoken); 

        expect(resp.statusCode).toEqual(200);
        expect(resp.body).toEqual({
            users: [
                {
                    username: 'u1',
                    firstName: 'U1F',
                    lastName: 'U1L',
                    email: 'user1@test.com',
                    isAdmin: false
                },
                {
                    username: 'u2',
                    firstName: 'U2F',
                    lastName: 'U2L',
                    email: 'user2@test.com',
                    isAdmin: false
                },
                {
                    username: 'u3',
                    firstName: 'U3F',
                    lastName: 'U3L',
                    email: 'user3@test.com',
                    isAdmin: true
                }
            ]
        })
    })

    test("Getting users with no auth", async function () {
        const resp = await request(app)
            .get("/users")

        expect(resp.statusCode).toEqual(401);
    })
})

describe("GET /users/:username", function () {
    test("Getting user works", async function() {
        const resp = await request(app)
            .get(`/users/user/u1`)
            .set("authorization", token); 


        expect(resp.statusCode).toEqual(200); 
        expect(resp.body).toEqual({
            user: {
                username: 'u1',
                firstName: 'U1F',
                lastName: 'U1L',
                email: 'user1@test.com',
                isAdmin: false
              }        
        })
    })
})