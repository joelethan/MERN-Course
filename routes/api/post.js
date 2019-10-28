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

// Get all posts
// public
router.get('/', (req, res) => {
    Post.find()
        .sort({ date: -1 }) // newest posts first
        .then(posts => res.json(posts))
        .catch(err => console.log(err))
})

// Get a post
// public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({errors:'Post not found'}))
})

module.exports = router;
