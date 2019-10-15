const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const user = require('./routes/api/user')
const profile = require('./routes/api/profile')
const passport = require('passport')

require('dotenv').config()

const app = express()

// Body parsermiddleware
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Connect to db
url_ = process.env.connectionString || 'mongodb://localhost/db1'
console.log(url_);

mongoose.connect(url_, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=>console.log('MongoDB Connected'))
    .catch(err => console.log(err))

// Passport middleware
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

app.get('/', (req, res)=> res.json({msg: 'Hello world!!'}))

// Use routes
app.use('/api/user', user)
app.use('/api/profile', profile)

module.exports = app
