const express = require('express')
const router = express.Router();
const mongoose = require('mongoose')
const passport = require('passport')

// Load profile and User models
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const validateProfileInput = require('../../validation/profile')
const validateExperienceInput = require('../../validation/experience')
const validateEducationInput = require('../../validation/education')

// Test route
// api/profile/test
router.get('/test', (req, res)=>res.json({msg: 'Profile working'}))

// Get current user's profile
// api/profile
router.get('/', passport.authenticate('jwt', { session: false }), (req, res)=> {
    Profile.findOne({ user: req.user.id })
        .populate('user', ['name', 'avatar'])
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
// api/profile
router.post('/', passport.authenticate('jwt', { session: false }), (req, res)=> {
    const { errors, isValid } = validateProfileInput(req.body)

    if(!isValid){
        // Return errors
        return res.status(400).json(errors)
    }

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
                mongoose.set('useFindAndModify', false);
                Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true  })
                    .then(profile => res.json(profile))
            } else {
                // Create Profile
                // Check if handle exists
                Profile.findOne({ handle: profileFields.handle })
                    .then(profile => {
                        let errors = {}
                        if(profile){
                            errors.handle = 'Handle already exists';
                            return res.status(400).json(errors)
                        }
                        new Profile(profileFields).save()
                            .then(profile => {
                                res.json(profile)
                            })
                        })
            }
    })
})

// Get profile by handle
// api/profile/handle/:handle
router.get('/handle/:handle', (req, res)=>{
    Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
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

// Get profile by userId
// api/profile/user/:user_id
router.get('/user/:user_id', (req, res)=>{
    Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        let errors = {}
        if(!profile){
            errors.noprofile = 'There is no profile for this user'
            return res.status(404).json(errors)
        }
        res.json(profile)
    })
    .catch(err => {
        res.status(404).json({noprofile: 'There is no profile for this user'})
    })
})

// Get all profiles
// api/profile/all
router.get('/all', (req, res)=>{
    Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
        let errors = {}
        if(!profiles){
            errors.noprofile = 'There is no profile for this user'
            return res.status(404).json(errors)
        }
        res.json(profiles)
    })
    .catch(err => {
        res.status(404).json({noprofile: 'There is no profiles'})
    })
})

// Add experience to the profile
// api/profile/experience
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res)=> {
    const { errors, isValid } = validateExperienceInput(req.body)

    if(!isValid){
        // Return errors
        return res.status(400).json(errors)
    }

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }
        // Add to experience array
        profile.experiences.unshift(newExp)
        profile.save()
            .then(profile => res.json(profile))
        })
})

// Add education to the profile
// api/profile/education
router.post('/education', passport.authenticate('jwt', { session: false }), (req, res)=> {
    const { errors, isValid } = validateEducationInput(req.body)

    if(!isValid){
        // Return errors
        return res.status(400).json(errors)
    }

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }
        // Add to education array
        profile.education.unshift(newEdu)
        profile.save()
            .then(profile => res.json(profile))
        })
})

// Delete experience from the profile
// api/profile/experience/exp_id
router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res)=> {

    Profile.findOne({ user: req.user.id }).then(profile => {
        const removeIndex = profile.experiences
            .map(item => item.id)
            .indexOf(req.params.exp_id)
        if(removeIndex === -1) return res.status(404).json({experience: "Not found"})
        profile.experiences.splice(removeIndex, 1)
        profile.save()
            .then(profile => res.json(profile))
            .catch(err => res.status(404).json(err))
    })
})

// Delete education from the profile
// api/profile/education/edu_id
router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res)=> {

    Profile.findOne({ user: req.user.id }).then(profile => {
        const removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.edu_id)
        if(removeIndex === -1) return res.status(404).json({education: "Not found"})
        profile.education.splice(removeIndex, 1)
        profile.save()
            .then(profile => res.json(profile))
            .catch(err => res.status(404).json(err))
    })
})

module.exports = router;
