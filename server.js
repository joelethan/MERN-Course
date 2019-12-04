const express = require('express')
const bodyParser = require('body-parser')
const passport = require('passport')

const user = require('./routes/api/user')
const profile = require('./routes/api/profile')
const post = require('./routes/api/post')

require('dotenv').config()

const app = express()

// Body parsermiddleware
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Passport middleware
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

app.get('/', (req, res)=> res.json({msg: 'Hello world!!'}))

// Use routes
app.use('/api/user', user)
app.use('/api/profile', profile)
app.use('/api/post', post)

module.exports = app
