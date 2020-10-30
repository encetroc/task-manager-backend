const mongoose = require('mongoose')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    sessions: [
        {
            token: {
                type: String,
                required: true
            },
            expiresAt: {
                type: Number,
                required: true
            }
        }
    ]
})

UserSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()
    return _.omit(userObject, ['password', 'sessions'])
}

UserSchema.methods.generateJsonWebToken = function() {
    const user = this
    return new Promise((resolve, reject) => {
        jwt.sign({_id: user._id.toHexString()}, process.env.SECRET, {expiresIn: "15m"}, (err, token) => {
            if (!err) {
                return resolve(token)
            } else {
                return reject(err)
            }
        })
    })
}

UserSchema.methods.generateRefreshToken = function() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buffer) => {
            if (!err) {
                resolve(buffer.toString('hex'))
            } else {
                reject(err)
            }
        })
    })
}

UserSchema.methods.createSession = function() {
    const user = this
    return user.generateRefreshToken().then((refreshToken) => {
        return saveSessionToDatabase(user, refreshToken)
    }).then(refreshToken => {
        return refreshToken
    }).catch(err => {
        return Promise.reject('failed to save session to database')
    })
}

UserSchema.statics.findByIdAndToken = function(_id, token) {
    const user = this
    return user.findOne(
        {
            _id,
            'sessions.token': token
        }
    )
}

UserSchema.statics.findByCredentials = function(email, password) {
    const user = this
    return user.findOne({email}).then(user => {
        if (!user) return Promise.reject()
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) resolve(user)
                else reject(err)
            })
        })
    })
}

UserSchema.statics.hasRefreshTokenExpired = function(expiresAt) {
    const secondsSinceEpoch = Date.now() / 1000
    expiresAt > secondsSinceEpoch ? false : true
}

UserSchema.pre('save', function(next) {
    const user = this
    const costFactor = 10
    if (user.isModified('password')) {
        bcrypt.genSalt(costFactor, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

const saveSessionToDatabase = (user, refreshToken) => {
    return new Promise((resolve, reject) => {
        const expiresAt = generateRefreshTokenExpiryTime()
        user.sessions.push( {token: refreshToken, expiresAt} )
        user.save().then(() => {
            return resolve(refreshToken)
        }).catch(err => reject(err))
    })
}

const generateRefreshTokenExpiryTime = () => {
    const daysUntilExpire = '10'
    const secondsUntilExpire = daysUntilExpire * 24 * 60 * 60
    return (Date.now() / 1000) + secondsUntilExpire
}

const User = mongoose.model('User', UserSchema)

module.exports = {User}