'use strict';

/*
 * Module dependencies.
 */

const mongoose = require('mongoose');
const local = require('./passport/local');
var jwtStrategy = require('passport-jwt').Strategy;
var ExtractJWT = require('passport-jwt').ExtractJwt;
const User = mongoose.model('User');

/**
 * Expose
 */

module.exports = function (passport) {

  // serialize and deserialize sessions
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => User.findById(id, done));

  // use these strategies
  passport.use(local);

  
  passport.use(new jwtStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey : 'very_big_secret_key'
  },
  function(jwt_payload, done){
    return User.findOne({_id : jwt_payload.id}, (err, user) => {
      if(err || !user) return done(err, false);
      return done(null, user);
    })
  }))

};
