const request = require('supertest')
const app = require('../src/app')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')
const { User } = require('../src/models/user')

beforeEach(setupDatabase)

test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Antonio Javier',
        email: 'link_epona584@hotmail.com',
        password: 'MyPass777!'
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Antonio Javier',
            email: 'link_epona584@hotmail.com'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('MyPass777!')
})

test('Should get profile for existing user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', userOne.tokens[0].token)
        .attach('avatar', 'test/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))

})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', userOne.tokens[0].token)
        .send({
            name: 'Javier'
        })
        .expect(200)

    // Ensure user name changed in db
    const user = await User.findById(userOneId)
    expect(user.name).toBe('Javier')
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', userOne.tokens[0].token)
        .send({
            location: '24.21,54.50'
        })
        .expect(403)
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)

    // Assert new token was added to user
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login to nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password + '11111'
    }).expect(400)
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    
    // Ensure user was deleted from database
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})