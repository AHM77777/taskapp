const express = require('express')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const { User, allowedUpdates } = require('../models/user')
const ImageUpload = require('../resources/multer')
const { sendWelcomeEmail, sendGoobyeEmail } = require('../emails/account')

const router = new express.Router()

// User routes
router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body)
        const token = await user.generateAuthToken()
        sendWelcomeEmail(user.email, user.name)

        res.status(201).send({ user, token: token})
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.send({ user, token: token })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(403).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        sendGoobyeEmail(req.user.email, req.user.name)
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/me/avatar', auth, ImageUpload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    // Save image data in user profile
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/users/me/avatar', auth, async (req, res) => {
    try {
        if (!req.user.avatar) {
            res.status(400).send('No Image found')
        }

        res.set('Content-Type', 'image/png')
        res.send(req.user.avatar)
    } catch (e) {
        res.status(500).send()
    }
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    if (req.user.avatar) {
        try {
            req.user.avatar = undefined
            await req.user.save()
        } catch (e) {
            return res.status(400).send()
        }
    }

    res.send()
})

module.exports = router