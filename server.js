'use strict';

/*
 * nodejs-express-mongoose
 * Copyright(c) 2015 Madhusudhan Srinivasa <madhums8@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies
 */
//const task = require('C:/Users/Alexander/Desktop/Новая папка/pr/eno-monitor-be/app/controllers/task');

require('dotenv').config();

const fs = require('fs');
const join = require('path').join;
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const config = require('./config');
//const util = require('./app/controllers/Util');
const constants = require('./config/constants');
var usersModel = require('./app/models/user');
const models = join(__dirname, 'app/models');
const port = process.env.PORT || 3000;
const http = require('http');
const app = express();
mongoose.Promise = require('bluebird');
const connection = connect();


/**
 * Expose
 */

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
require('./config/express')(app, passport);
require('./config/routes')(app, passport);

connection
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen);

   //viber bot
   var winston = require('winston');
const toYAML = require('winston-console-formatter');
const { formatter, timestamp } = toYAML();

function createLogger() {
  const logger = new winston.Logger({
      level: "debug" // We recommend using the debug level for development
  });
  logger.add(winston.transports.Console, {formatter, timestamp});
  return logger;
}
const logger = createLogger();

const ViberBot  = require('viber-bot').Bot;
const BotEvents = require('viber-bot').Events;
const TextMessage = require('viber-bot').Message.Text;

  const bot = new ViberBot(logger, {
    authToken: "492dd39cdd67d7e9-8183cf8aa72f5f83-4b9561e01920061f", 
    name: "testBotEnovate",  
    avatar: "" 
});
if(bot)console.log('/////////////////// bot true ////////////////////////');

//app.use(bot.middleware());

bot.onSubscribe(response => {
  console.log(' 00000000000000000000000000 subscribe 00000000000000000000000000');
  var user = {
    name: response.userProfile.name,
    phone: response.userProfile.id,
  }
  usersModel.save(user, function(err){
    if(err)console.log(err);
    else console.log('xxxxxxxxxxx save xxxxxxxxxxxxxxxxxxx');
  })
  bot.sendMessage(response.userProfile, new TextMessage('Hello ' + response.userProfile.name))
});
bot.onUnsubscribe(userId => console.log(`000000000000000000000000000 Unsubscribed: ${userId} 0000000000000000000000000000`));
bot.on(BotEvents.MESSAGE_RECEIVED, (message, response) => {
  console.log(' ---------------------------------- event --------------------------------');
	// Echo's back the message to the client. Your bot logic should sit here.
	response.send(message);
});
bot.onTextMessage(/./, (message, response) =>
    response.send(new TextMessage(`Hi there ${response.userProfile.name}. I am ${bot.name}`)));

bot.on(BotEvents.SUBSCRIBED,  response => {
      console.log(' 00000000000000000000000000 subscribe 00000000000000000000000000');
      response.send(new TextMessage(`Hi there ${response.userProfile.name}. I am ${bot.name}`))
    });

function listen () {
  if (app.get('env') === 'test') return;
  var server = http.createServer(bot.middleware())(port, () => bot.setWebhook('https://damp-tundra-61257.herokuapp.com/'));
  
  var ws = require('ws')
    var clients = {};
    var socketServer = new ws.Server({
      server: server
    });
    socketServer.on('connection', (socket) => {
        var id = Math.random();
        clients[id] = socket;
        console.log("новое соединение " + id);
        socket.on('message', (msg) => {
            console.log('получено сообщение ' + msg);
            var msgPars = JSON.parse(msg);

            for(var key in clients){
                clients[key].send(msg);
            }
        })
        socket.on('close', () => {
            console.log('соединение закрыто ' + id); 
            delete clients[id];
        })
    })
  // var options = {
  //   //    'log level': 0
  //   };
  // const io = require('socket.io').listen(connectApp, options);
  // io.sockets.on('connection', (client) => {
  //   client.on('message', function (message) {
  //       try {
  //         client.to(message.id).emit('message', message);
  //           //client.emit('message', message);
  //          // client.broadcast.emit('message', message);
  //       } catch (e) {
  //           console.log(e);
  //           client.disconnect();
  //       }
  //   });
  // });

  console.log('Express app started on port ' + port);
}  




function connect () {
  var options = { poolSize:20,useMongoClient: true };
  var connection = mongoose.connect(config.db, options);
  return connection;
}

