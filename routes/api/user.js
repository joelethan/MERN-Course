const express = require('express')
const router = express.Router();
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const dotenv = require('dotenv')

dotenv.config()

// Load Input validation
const validateRegisterInput = require('../../validation/register')
const validateLoginInput = require('../../validation/login')

// Load User model
const User = require('../../models/User')

router.get('/', (req, res)=>res.json({msg: 'Users working'}))

// Register User
router.post('/register', (req, res)=>{

    const { errors, isValid } = validateRegisterInput(req.body)

    // Check Validation
    if(!isValid){
        return res.status(400).json(errors)
    }
    User.findOne({email: req.body.email})
        .then(user =>{
            if(user){
                errors.email = 'Email already exists'
                return res.status(400).json(errors)
            }else{
                const avatar = gravatar.url(req.body.email, {
                    s: 200, //size
                    r: 'pg', //rating
                    d: 'mm' //default
                })
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                })

                bcrypt.genSalt(10, (err, salt)=>{
                    bcrypt.hash(newUser.password, salt, (err, hash)=>{
                        // if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            // .catch(err => console.log(err))
                    })
                })
            }
        })
})

router.post('/login', (req, res)=>{

    const { errors, isValid } = validateLoginInput(req.body)

    // Check Validation
    if(!isValid){
        return res.status(400).json(errors)
    }
    const email = req.body.email
    const password = req.body.password

    // Find user by email
    User.findOne({email})
        .then(user=>{
            // check for user
            if(!user){
                errors.email = 'User not found'
                return res.status(404).json(errors)
            }
            // check passsword
            bcrypt.compare(password, user.password)
                .then(isMatch=>{
                    if(isMatch){
                        const payload = {id: user.id, name: user.name, avatar: user.avatar}
                        const secretOrKey = process.env.secretOrKey || 'key'
                        jwt.sign(payload, secretOrKey, { expiresIn: 3600 }, (er, token)=>{
                            res.json({
                                success: true,
                                token: 'Bearer ' + token
                            })
                        })
                        
                    }else{
                        errors.password = 'Password incorrent'
                        return res.status(404).json(errors)
                    }
                })
        })
})

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res)=>{
    res.json({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar
    })
})

module.exports = router;
