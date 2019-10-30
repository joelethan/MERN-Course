const express = require('express')
const router = express.Router();
const mongoose = require('mongoose')
const passport = require('passport')

// load Post and Profile models
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')

// import validation
const validatePostInput = require('../../validation/post')

// Test route
// api/post/test
// public
router.get('/test', (req, res)=> res.json({msg: 'Working posts'}))

// Create post
// api/post
// private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
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
// api/post
// public
router.get('/', (req, res) => {
    Post.find()
        .sort({ date: -1 }) // newest posts first
        .then(posts => res.json(posts))
        .catch(err => console.log(err))
})

// Get a post
// api/post/:id
// public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(() => res.status(404).json({errors:'Post not found'}))
})

// Get a post
// private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({user: req.user.id})
        .then(profile => {
            if(!profile) return res.status(404).json({noprofile: 'Profile not found'})
            Post.findOne({_id: req.params.id})
                .then(post => {
                    if(post.user.toString() !== profile.user.toString()) {
                        return res.status(401).json({ notauthorised: 'User not authorised'})
                    }
                    post.remove().then(()=> res.json({msg: 'Deleted successfully'}))
                })
                .catch(() => res.status(404).json({nopost: 'Post not found'}))
            })
})

// Like a post
// api/post/like/:id
// private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({user: req.user.id})
        .then(profile => {
            if(!profile) return res.status(404).json({noprofile: 'Profile not found'})
            Post.findOne({_id: req.params.id})
                .then(post => {
                    console.log(post.likes.filter(like => like.user.toString() === req.user.id).length);
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
                        return res.status(400).json({ alreadyliked: 'User already liked this post'})
                    }
                    // Add the user id to the likes array
                    post.likes.unshift({ user: req.user.id })
                    post.save().then(post => res.json(post))
                })
                .catch(() => res.status(404).json({nopost: 'Post not found'}))
            })
})

// Unlike a post
// api/post/unlike/:id
// private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({user: req.user.id})
        .then(profile => {
            if(!profile) return res.status(404).json({noprofile: 'Profile not found'})
            Post.findOne({_id: req.params.id})
                .then(post => {
                    console.log(post.likes.filter(like => like.user.toString() === req.user.id).length);
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
                        return res.status(400).json({ notliked: 'User has not liked this post'})
                    }
                    // Index to remove
                    const removeIndex = post.likes
                        .map(like => like.user)
                        .indexOf(req.user.id)
                    
                    // Remove the user id from the likes array
                    post.likes.splice(removeIndex, 1)
                    post.save().then(post=>res.json(post))
                    
                })
                .catch(() => res.status(404).json({nopost: 'Post not found'}))
            })
})

module.exports = router;
