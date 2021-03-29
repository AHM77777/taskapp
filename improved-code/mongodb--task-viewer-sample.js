// CRUD operations
const mongodb = require('mongodb')

const { MongoClient, ObjectID } = mongodb

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

const id = new ObjectID()
console.log(id)
console.log(id.getTimestamp())

MongoClient.connect(connectionURL, { useNewUrlParser: true}, async (error, client) => {
    if (error) {
        return console.log('Unable to connect to database!')
    }

    const db = client.db(databaseName)

    try {
       const res = await db.collection('tasks').insertMany([
           {
               description: 'Another new task',
               completed: false
           },
           {
               description: 'This is another new task as well',
               completed: false
           },
           {
               description: 'This task is ready',
               completed: true
           }
        ])
   
        const complete_task_cursor = await db.collection('tasks').find({ completed: true }).toArray()
        const total_complete_tasks = complete_task_cursor.map(task => task)
        const new_complete_tasks = res.ops.filter(task => {
           if (task.completed) {
              return task
           }
       })

        const uncomplete_task_cursor = await db.collection('tasks').find({ completed: false }).toArray()
        const total_uncomplete_tasks = uncomplete_task_cursor.map(task => task)
        const new_uncomplete_tasks = res.ops.filter(task => {
           if (!task.completed) {
              return task
           }
       })

        console.log(`
        Added ${res.insertedCount} new tasks:
          - Complete tasks: Before (${Math.abs(total_complete_tasks.length - new_complete_tasks.length)}) -> Now (${total_complete_tasks.length})
          - Uncomplete tasks: Before (${Math.abs(total_uncomplete_tasks.length - new_uncomplete_tasks.length)}) -> Now (${total_uncomplete_tasks.length})
        `)
    } catch(e) {
        return console.log('There was an error performing the operation: ' + e)
    }
   //  db.collection('tasks').insertOne({
   //      _id: id,
   //      description: 'This is a test task',
   //      completed: false
   //  })

   //  db.collection('users').insertOne({
   //      name: 'Antonio',
   //      age: 24
   //  }, (error, result) => {
   //      if (error) {
   //          return console.log('Unable to insert user')
   //      }

   //      console.log(result.ops)
   //  })

   // db.collection('users').insertMany([
   //     {
   //         name: 'Antonio',
   //         age: 24
   //     },
   //     {
   //         name: 'Javier',
   //         age: 24
   //     }
   // ], (error, result) => {
   //     if (error) {
   //         return console.log('Unable to insert users')
   //     }

   //     console.log(result.ops)
   // })

   // db.collection('tasks').insertMany([
   //     {
   //         description: 'Prepare test entries for database',
   //         completed: true
   //     },
   //     {
   //         description: 'Insert entries in database',
   //         completed: true
   //     },
   //     {
   //         description: 'Complete challenge and start new video',
   //         completed: false
   //     }
   // ], (error, result) => {
   //     if (error) {
   //         return console.log('Unable to insert tasks')
   //     }

   //     console.log(result.ops)
   // })
})