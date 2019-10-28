const express = require('express')
const router = express.Router();
const mongoose = require('mongoose')
const passport = require('passport')

// load Post model
const Post = require('../../models/Post')

// import validation
const validatePostInput = require('../../validation/post')

// Test route
// public
router.get('/test', (req, res)=> res.json({msg: 'Working posts'}))

// Create post
// private
router.post('/',passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body)

    if(!isValid){
        // Return errors
        return res.status(400).json(errors)
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    })
    newPost.save().then(post => res.json(post))

})

module.exports = router;
