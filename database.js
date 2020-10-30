const mongoose = require('mongoose')
require('dotenv/config')

mongoose.Promise = global.Promise
mongoose.connect(
    process.env.DB_CONNECTION,
    {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true}
).then(
    console.log('db is up')
).catch(
    e => console.log('error with db', e)
)

module.exports = {
    mongoose
}