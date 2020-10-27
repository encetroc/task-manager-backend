const express = require('express')
const app = express()

/**
 * GET /lists
 * Purpose: Get all lists for a given user
 */
app.get('/lists', (req, res) => {})

/**
 * POST /lists
 * Purpose: Create a new list
 */
app.post('/lists', (req, res) => {})

/**
 * PATCH /lists
 * Purpose: Update a list
 */
app.patch('/lists/:id', (req, res) => {})

/**
 * DELETE /lists
 * Purpose: Delete a list
 */
app.delete('/lists/:id', (req, res) => {})

app.listen('3000', console.log("server is up"))