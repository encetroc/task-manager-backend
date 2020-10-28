const express = require('express')
const app = express()
const {List, Task} = require('./models')
const {mongoose} = require('./database')
const cors = require('cors')
const { response } = require('express')

app.use(cors())
app.use(express.json())

/**
 * GET /lists
 * Purpose: Get all lists
 */
app.get('/lists', (req, res) => {
    List.find().then(lists => {
        res.send(lists)
    })
})

/**
 * POST /lists
 * Purpose: Create a new list
 */
app.post('/lists', (req, res) => {
    const title = req.body.title
    const list = new List({title})
    list.save().then(newList => res.send(newList))
})

/**
 * PATCH /lists
 * Purpose: Update a list
 */
app.patch('/lists/:id', (req, res) => {
    List.findByIdAndUpdate(req.params.id, {$set: req.body}).then(res.sendStatus(200))
})

/**
 * DELETE /lists
 * Purpose: Delete a list
 */
app.delete('/lists/:id', (req, res) => {
    List.findByIdAndDelete(req.params.id).then(res.sendStatus(200))
})

/**
 * GET /lists/:listId/tasks
 * Purpose: Get all tasks in a list
 */
app.get('/lists/:listId/tasks', (req, res) => {
    Task.find({_listId: req.params.listId}).then(tasks => res.send(tasks))
})

/**
 * POST /lists/:listId/tasks
 * Purpose: Create a new task in a list
 */
app.post('/lists/:listId/tasks', (req, res) => {
    const task = new Task({title: req.body.title, _listId: req.params.listId})
    task.save().then(newTask => res.send(newTask))
})

/**
 * GET /tasks/:id
 * Purpose: Get a task
 */
app.get('/tasks/:id', (req, res) => {
    Task.findById(req.params.id).then(task => res.send(task))
})

/**
 * PATCH /tasks/:taskId
 * Purpose: Update a task
 */
app.patch('/tasks/:id', (req, res) => {
    Task.findByIdAndUpdate(req.params.id, {$set: req.body}).then(res.sendStatus(200))
})

/**
 * DELETE /tasks/:id
 * Purpose: Delete a task
 */
app.delete('/tasks/:id', (req, res) => {
    Task.findByIdAndDelete(req.params.id).then(res.sendStatus(200))
})

app.listen('3000', console.log("api is up"))