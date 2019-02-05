
/**
 * Expose
 */

module.exports = {
  db: 'mongodb://heroku_1b2m3wbk:sa0iqijashe2qn541rt77k4lrp@ds237932.mlab.com:37932/heroku_1b2m3wbk',
  wss: 'wss://damp-tundra-61257.herokuapp.com/',
  facebook: {
    clientID: 'APP_ID',
    clientSecret: 'SECRET',
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
    scope: [
      'email',
      'user_about_me',
      'user_friends'
    ]
  },
  google: {
    clientID: 'APP_ID',
    clientSecret: 'SECRET',
    callbackURL: 'http://localhost:3000/auth/google/callback',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.google.com/m8/feeds',
    ]
  }
};
