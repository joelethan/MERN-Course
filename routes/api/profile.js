const express = require('express')
const router = express.Router();
const mongoose = require('mongoose')
const passport = require('passport')

// Load profile and User models
const Profile = require('../../models/Profile')
const User = require('../../models/User')

router.get('/', (req, res)=>res.json({msg: 'Profile working'}))

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

module.exports = router;
