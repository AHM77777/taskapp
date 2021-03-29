const request = require('supertest')
const app = require('../src/app')
const { Task } = require('../src/models/task')
const { userOneId, userOne, userTwo, taskOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create task for authenticated user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Added through Jest',
            completed: true
        })
        .expect(201)
    
    // Task owner must be test user
    expect(response.body.owner.toString()).toEqual(userOneId.toString())
})

test('Should authenticated user tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            sortBy: 'createdAt:desc'
        })
        .expect(200)

    // Ensure we get an array with two tasks
    expect(response.body.length).toEqual(2)
})

test('Should not delete task for wrong owner', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
    
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})