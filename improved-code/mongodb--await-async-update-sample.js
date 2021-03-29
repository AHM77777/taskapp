// CRUD operations
(async () => {
    const mongodb = require('mongodb')

    const { MongoClient, ObjectId } = mongodb
    
    const connectionURL = 'mongodb://127.0.0.1:27017'
    const databaseName = 'task-manager'
    
    const client = await MongoClient.connect(connectionURL, { useNewUrlParser: true }).catch(err => console.log(err))

    if (!client) {
        return console.log('Unable to connect to database!')
    }

    const db = client.db(databaseName)
    try {
        const update_promise = await db.collection('users').updateOne({
            _id: ObjectId("605ce790cc5a511890ead2ee")
        }, {
            $set: {
                name: 'Hernandez'
            }
        })

        console.log(update_promise.result.ok)
        console.log(update_promise.result.nModified)

    } catch (e) {
        console.log(e)
    }
})()