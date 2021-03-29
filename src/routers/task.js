const express = require('express')
const auth = require('../middleware/auth')
const { Task, allowedUpdates } = require('../models/task')

const router = new express.Router()

// Task routes
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const options = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.limit) {
        options.limit = parseInt(req.query.limit)
    }

    if (req.query.skip) {
        options.skip = parseInt(req.query.skip)
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        options.sort = {}
        options.sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options
        }).execPopulate()
        if (!req.user.tasks) {
            return res.status(404).send()
        }

        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(403).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send()
        }

        updates.forEach(update => task[update] = req.body[update])

        await task.save()

        res.send(task)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router