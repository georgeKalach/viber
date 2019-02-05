
/**
 * Module dependencies.
 */

var express = require('express');
var session = require('express-session');
var compression = require('compression');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cors = require('cors');
const join = require('path').join;
var mongoStore = require('connect-mongo')(session);
var winston = require('winston');
//const toYAML = require('winston-console-formatter');
//const { formatter, timestamp } = toYAML();
var config = require('./');
var pkg = require('../package.json');

let responseHandler=require('../app/controllers/response-handler');
let requestValidator=require('../app/controllers/request-validator');

var env = process.env.NODE_ENV || 'development';
/**
 * Expose
 */

module.exports = function (app, passport) {

  app.set('views', join(__dirname.replace('config', 'public'), 'views'))
  app.set('view engine', 'ejs')

  app.use(cors({
    origin: '*',
    credentials: true
  }));

  // Compression middleware (should be placed before express.static)
  app.use(compression({
    threshold: 512
  }));

  // Static files middleware
  app.use(express.static(config.root + '/public'));

  // Use winston on production
  var log;
  if (env !== 'test') {
    log = {
      stream: {
        write: function (message, encoding) {
          winston.info(message);
        }
      },
      skip: function (req, res) {
        if (req.url == '/files/status') {
            return true;
        } else {
            return false;
        }
      }
    }; 
  } else {
    log = {};
  }

  // Don't log during tests
  // Logging middleware
  if (env !== 'test') app.use(morgan('dev',log));

  // bodyParser should be above methodOverride
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method;
      delete req.body._method;
      return method;
    }
  }));

  // cookieParser should be above session
  const jsonParser = express.json();
  app.use(jsonParser);
  app.use(cookieParser());
  app.use(cookieSession({ secret: 'secret' }));
  app.use(session({
    secret: pkg.name,
    proxy: true,
    resave: true,
    saveUninitialized: true,
    store: new mongoStore({
      url: config.db,
      collection : 'sessions'
    })
  }));

  // use passport session
  app.use(passport.initialize());
  app.use(passport.session());

  // app.set('view engine', 'jade');

  app.use(responseHandler);
  app.use(requestValidator);

  //jwt secret
  app.set("secret", "very_big_secret_key");
};
