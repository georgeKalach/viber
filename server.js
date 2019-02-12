'use strict';

require('dotenv').config();

const fs = require('fs');
const join = require('path').join;
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const config = require('./config');
var wialons = require('./app/controllers/wialon')
const models = join(__dirname, 'app/models');
const port = process.env.PORT || 3000;

const app = express();
mongoose.Promise = require('bluebird');
const connection = connect();

const webhookUrl = 'https://cbb67ec5.ngrok.io';
const ViberBot  = require('viber-bot').Bot;

var winston = require('winston');
const toYAML = require('winston-console-formatter');
const { formatter, timestamp } = toYAML();
const logger = createLogger();

const bot = new ViberBot(logger, {
  authToken: "492dd39cdd67d7e9-8183cf8aa72f5f83-4b9561e01920061f", 
  name: "Support",  
  avatar: `${__dirname}/public/img/avatar.jpg` 
});

module.exports = {
  app,
  connection,
};

// Bootstrap models
fs.readdirSync(models)
  .filter(file => ~file.indexOf('.js'))
  .forEach(file => require(join(models, file)));

// Bootstrap routes
require('./config/passport')(passport);
require('./config/express')(app, passport, bot);
require('./config/routes')(app, passport, bot);

connection
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen);

function listen() {
  if (app.get('env') === 'test') return;
  app.listen(port, () => bot.setWebhook(webhookUrl));
  console.log('Express app started on port ' + port);
  wialons.wialonCreate('admin', '');

}

function connect() {
  var options = { poolSize: 20, useMongoClient: true};
  var connection = mongoose.connect(config.db, options);
  return connection;
}

function createLogger(){
  const logger = new winston.Logger({
      level: "debug" // We recommend using the debug level for development
  });
  logger.add(winston.transports.Console, {formatter, timestamp});
  return logger;
}


/////////////////// scheduler
const scheduler = require('node-schedule');
const wialonStatus = require('./app/controllers/wialon');

scheduler.scheduleJob('*/10 * * * * *', function(){
  wialonStatus.wialonStatus();
})