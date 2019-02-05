
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
var User = mongoose.model('User');
var bcrypt = require('bcryptjs');

/**
 * Expose
 */

module.exports = new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function (email, password, done) {
    var options = {
      email: email
    };
    User.findOne(options, function (err, user) {
      if (err) return done(err);
      if (!user) {
        return done(null, false, { message: 'Unknown user' });
      }
      bcrypt.compare(password, user.password, function(err, res){
        if(err) return done(err);
        if(!res) {
         return done(null, false, { message: 'Invalid password' });
        }
        return done(null, user);
      })
    });
  }
);