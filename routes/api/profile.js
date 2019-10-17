const express = require('express')
const router = express.Router();
const mongoose = require('mongoose')
const passport = require('passport')

// Load profile and User models
const Profile = require('../../models/Profile')
const User = require('../../models/User')

router.get('/', (req, res)=>res.json({msg: 'Profile working'}))

// Get current user's profile
router.get('/profile', passport.authenticate('jwt', { session: false }), (req, res)=> {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            let errors = {}
            if(!profile){
                errors.noprofile = 'There is no profile for this user'
                return res.status(404).json(errors)
            }
            res.json(profile)
        })
        .catch(err => res.status(404).json(err))
})

// Create/Update User profile
router.post('/profile', passport.authenticate('jwt', { session: false }), (req, res)=> {
    const profileFields = {}
    profileFields.user = req.user.id
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.bio) profileFields.bio = req.body.bio;
    if(req.body.status) profileFields.status = req.body.status;
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
    // Skills => split into array
    if(typeof req.body.skills !=='undefined') profileFields.skills = req.body.skills.split(',');
    profileFields.socials = {}
    if(req.body.youtube) profileFields.socials.youtube = req.body.youtube;
    if(req.body.facebook) profileFields.socials.facebook = req.body.facebook;
    if(req.body.linkedin) profileFields.socials.linkedin = req.body.linkedin;
    if(req.body.twitter) profileFields.socials.twitter = req.body.twitter;

    Profile.findOne({user: req.user.id})
        .then(profile => {
            if(profile){
                // Profile Update
                Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new:true  })
                    .then(profile => res.json(profile))
            } else {
                // Create Profile
                // Check if handle exists
                Profile.findOne({ handle: profileFields.handle })
                    .then(profile => {
                        let errors = {}
                        if(profile){
                            errors.handle = 'Handle already exists';
                            res.status(400).json(errors)
                        }
                        new Profile(profileFields).save()
                            .then(profile => {
                                res.json(profile)
                            })
                        })
                    }
                })
            })

module.exports = router;
