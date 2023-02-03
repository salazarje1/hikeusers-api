const db = require("../db.js"); 
const User = require("./users.js"); 
const bcrypt = require("bcrypt"); 

const { BCRYPT_WORK_FACTOR } = require("../config"); 
const { UnauthorizedError } = require("../expressError");

beforeAll(async () => {
    await db.query("Delete From users"); 

    await db.query(`
        Insert Into users (
            username, 
            password,
            first_name, 
            last_name,
            email
        ) 
        Values ('u1', $1, 'U1F', 'U1L', 'u1@test.com'),
               ('u2', $2, 'U2F', 'U2L', 'u2@test.com')
        Returning username
    `, [
        await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
        await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ]); 
})

beforeEach(async () => {
    await db.query("Begin"); 
})

afterEach(async () => {
    await db.query("Rollback"); 
})

afterAll(async () => {
    await db.end(); 
})

describe("auth user", function () {
    test('good auth', async function() {
        const user = await User.authenticate("u1", "password1"); 
        expect(user).toEqual({
            username: 'u1',
            firstName: 'U1F',
            lastName: 'U1L',
            email: 'u1@test.com',
            isAdmin: false
        })
    })

    test('no good auth, wrong password', async function () {
        try {
            await User.authenticate("c1", "bad"); 
            fail(); 
        } catch(err) {
            expect(err instanceof UnauthorizedError).toBeTruthy(); 
        }
    })
})

describe("get all users", function () {
    test("all users", async function () {
        const users = await User.findAll();
        expect(users).toEqual([
            {
              username: 'u1',
              firstName: 'U1F',
              lastName: 'U1L',
              email: 'u1@test.com',
              isAdmin: false
            },
            {
              username: 'u2',
              firstName: 'U2F',
              lastName: 'U2L',
              email: 'u2@test.com',
              isAdmin: false
            }
          ]
    ) 
    })
})

describe("get user", function() {
    test("get one user", async function () {
        let user = await User.getUser("u1"); 
        expect(user).toEqual({
            username: 'u1',
            firstName: 'U1F',
            lastName: 'U1L',
            email: 'u1@test.com',
            isAdmin: false
          }
    )
    })
})