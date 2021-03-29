require('../src/db/mongoose')
const Task = require('../src/models/task')

const deleteTaskAndCount = async id => {
    try {
        await Task.findByIdAndDelete(id)
        const incompleteTasks = await Task.countDocuments({completed: false})
        console.log(incompleteTasks)
    } catch (e) {
        console.log(e)
    }
}

deleteTaskAndCount('605eb17181e6eb05e8b67e59')