require('../src/db/mongoose')
const User = require('../src/models/user')

const updateAgeAndCount = async (id, age) => {
    try {
        const user = await User.findByIdAndUpdate(id, {age})
        if (!user) {
            return console.log('No user with that ID found.')
        }
    
        const sameAgeUsers = await User.countDocuments({age})
        console.log(sameAgeUsers)
    } catch (e) {
        console.log(e.message)
    }
}

updateAgeAndCount('605e9be26f66322648c061d2', 24)