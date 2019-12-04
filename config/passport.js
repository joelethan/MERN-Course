const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose')
const User = mongoose.model('users')

const dotenv = require('dotenv')
dotenv.config()

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.secretOrKey || 'key'

module.exports = passport =>{
    passport.use(new jwtStrategy(opts, (jwt_payload, done)=>{
        User.findById(jwt_payload.id)
            .then(user=>{
                if(user){
                    return done(null, user)
                }/* istanbul ignore next */
                return done(null, false)
            })
            .catch(
                /* istanbul ignore next */
                err => console.log(err)
                )
    }))
}
