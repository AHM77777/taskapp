const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Task } = require('./task')

const secretKey = process.env.JWT_SECRET

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate: email => {
            if (!validator.isEmail(email)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate: password => {
            if (password.toLowerCase() === 'password') {
                throw new Error('Please try another word for your password')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate: age => {
            if (age < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true,

        }
    }],
    avatar: {
        type: Buffer,
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function() {
    const user = this.toObject()

    delete user.password
    delete user.tokens
    delete user.avatar
    
    return user
}

userSchema.methods.generateAuthToken = async function() {
    const token = jwt.sign({ _id: this._id.toString() }, secretKey)

    this.tokens = this.tokens.concat({ token: token })
    await this.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user;
}

// Encrypt user password
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }

    next()
})

userSchema.pre('remove', async function(next) {
    await Task.deleteMany({ owner: this._id })
    next()
})

const User = mongoose.model('User', userSchema)
const allowedUpdates = ['name', 'email', 'password', 'age']

module.exports = {
    User,
    allowedUpdates,
    secretKey
}