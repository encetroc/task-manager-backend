const express = require('express')
const app = express()
const {List, Task, User} = require('./models')
const {mongoose} = require('./database')
const cors = require('cors')
const { response } = require('express')

/* app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
}); */

app.use(cors())
app.use(express.json())

const verifySession = (req, res, next) => {
    const refreshToken = req.header('x-refresh-token')
    const _id = req.header('_id')
    User.findByIdAndToken(_id, refreshToken).then(user => {
        if (!user) return Promise.reject({message: 'user not found'})
        req.user_id = _id
        req.refreshToken = refreshToken
        const isSessionValid = false
        user.sessions.forEach(session => {
            if (session.token === refreshToken) {
                if (!User.hasRefreshTokenExpired(session.expiresAt)) {
                    isSessionValid = true
                }
            }
        })
        if (isSessionValid) next()
        else return Promise.reject({message: 'session is not valid'})
    }).catch (err => res.status(401).send(err))
}

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
    list.save()
    .then(newList => res.send(newList))
    .catch(err => send(err))
})

/**
 * PATCH /lists
 * Purpose: Update a list
 */
app.patch('/lists/:id', (req, res) => {
    List.findByIdAndUpdate(req.params.id, {$set: req.body})
    .then(res.send({message: 'updated'}))
    .catch(err => send(err))
})

/**
 * DELETE /lists
 * Purpose: Delete a list
 */
app.delete('/lists/:id', (req, res) => {
    List.findByIdAndDelete(req.params.id)
    .then(res.sendStatus(200))
    .catch(err => send(err))
})

/**
 * GET /lists/:listId/tasks
 * Purpose: Get all tasks in a list
 */
app.get('/lists/:listId/tasks', (req, res) => {
    Task.find({_listId: req.params.listId})
    .then(tasks => res.send(tasks))
    .catch(err => send(err))
})

/**
 * POST /lists/:listId/tasks
 * Purpose: Create a new task in a list
 */
app.post('/lists/:listId/tasks', (req, res) => {
    const task = new Task({title: req.body.title, _listId: req.params.listId})
    task.save()
    .then(newTask => res.send(newTask))
    .catch(err => send(err))
})

/**
 * GET /tasks/:id
 * Purpose: Get a task
 */
app.get('/tasks/:id', (req, res) => {
    Task.findById(req.params.id)
    .then(task => res.send(task))
    .catch(err => send(err))
})

/**
 * PATCH /tasks/:taskId
 * Purpose: Update a task
 */
app.patch('/tasks/:id', (req, res) => {
    Task.findByIdAndUpdate(req.params.id, {$set: req.body})
    .then(res.send({message: 'success'}))
    .catch(err => send(err))
})

/**
 * DELETE /tasks/:id
 * Purpose: Delete a task
 */
app.delete('/tasks/:id', (req, res) => {
    Task.findByIdAndDelete(req.params.id)
    .then(res.sendStatus(200))
    .catch(err => send(err))
})

/**
 * POST /users
 * Purpose: Sign up
 */
app.post('/users', (req, res) => {
    const body = req.body
    const user = new User(body)
    user.save().then(() => {
        return user.createSession()
    }).then((refreshToken) => {
        return user.generateJsonWebToken().then((accessToken) => {
            return {accessToken, refreshToken}
        })
    }).then((authTokens) => {
        res.header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(user)
    }).catch(err => res.status('400').send({message: 'no signup'}))
})

/**
 * POST /users/login
 * Purpose: login
 */
app.post('/users/login', (req, res) => {
    const email = req.body.email
    const password = req.body.password
    User.findByCredentials(email, password).then(user => {
        return user.createSession().then(refreshToken => {
            return user.generateJsonWebToken().then(accessToken => {
                return {accessToken, refreshToken}
            })
        }).then(authTokens => {
            res.header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(user)
        })
    }).catch(err => res.status('400').send(err))
})

/**
 * GET /users/me/access-token
 * Purpose: Get a new access token
 */
app.get('/users/me/access-token', verifySession, (req, res) => {

})

app.listen('3000', console.log("api is up"))