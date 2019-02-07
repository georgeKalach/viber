'use strict';

require('dotenv').config();

const fs = require('fs');
const join = require('path').join;
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const config = require('./config');
const models = join(__dirname, 'app/models');
const port = process.env.PORT || 3000;

const app = express();
mongoose.Promise = require('bluebird');
const connection = connect();

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

const toYAML = require('winston-console-formatter');
const { formatter, timestamp } = toYAML();
const ViberBot  = require('viber-bot').Bot;
const BotEvents = require('viber-bot').Events;
const TextMessage = require('viber-bot').Message.Text;
var winston = require('winston');

const logger = createLogger();
const bot = new ViberBot(logger, {
  authToken: "492dd39cdd67d7e9-8183cf8aa72f5f83-4b9561e01920061f", 
  name: "testBotEnovate",  
  avatar: `${__dirname}/public/img/icona.JPG` 
});
console.log('///////////////////' + bot.name);
const webhookUrl = ' https://damp-tundra-61257.herokuapp.com/';
app.use(() => bot.setWebhook(webhookUrl), bot.middleware());

connection
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen);

function listen() {
  if (app.get('env') === 'test') return;
  app.listen(port, );
  console.log('Express app started on port ' + port);
  
}

function connect() {
  var options = { poolSize: 20, useMongoClient: true };
  var connection = mongoose.connect(config.db, options);
  return connection;
}





// 'use strict';

// require('dotenv').config();
// const fs = require('fs');
// const join = require('path').join;
// const port = process.env.PORT || 3000;
// var winston = require('winston');
// const toYAML = require('winston-console-formatter');
// const { formatter, timestamp } = toYAML();
// const ViberBot  = require('viber-bot').Bot;
// const BotEvents = require('viber-bot').Events;
// const TextMessage = require('viber-bot').Message.Text;
// const express = require('express');
// const config = require('./config');
// const passport = require('passport');
// const models = join(__dirname, 'app/models');
// const app = express();
// //const connection = connect();

// // Bootstrap models
// fs.readdirSync(models)
//   .filter(file => ~file.indexOf('.js'))
//   .forEach(file => require(join(models, file)));

// require('./config/passport')(passport);
// require('./config/express')(app, passport);
// //require('./config/routes')(app, passport);

// const logger = createLogger();

// module.exports = {
//   app,
//   //connection,
// };

// const bot = new ViberBot(logger, {
//     authToken: "492dd39cdd67d7e9-8183cf8aa72f5f83-4b9561e01920061f", 
//     name: "testBotEnovate",  
//     avatar: `${__dirname}/public/img/icona.JPG` 
// });
// console.log('///////////////////' + bot.name);
// const webhookUrl = ' https://damp-tundra-61257.herokuapp.com/';
// app.use(bot.setWebhook(webhookUrl), bot.middleware());


// // connection
// //   .on('error', console.log)
// //   .on('disconnected', connect)
// //   .once('open', listen);

// //function listen() {
//   //if (app.get('env') === 'test') return;
//   app.listen(port);
//   console.log('Express app started on port ' + port);
// //}

// //app.use(bot.setWebhook('https://damp-tundra-61257.herokuapp.com/'), bot.middleware());

// // bot.onSubscribe(response => {
// //   console.log(' 00000000000000000000000000 subscribe 00000000000000000000000000');
// //   // var user = {
// //   //   name: response.userProfile.name,
// //   //   phone: response.userProfile.id,
// //   // }
// //   // usersModel.save(user, function(err){
// //   //   if(err)console.log(err);
// //   //   else console.log('xxxxxxxxxxx save xxxxxxxxxxxxxxxxxxx');
// //   // })
// //   bot.sendMessage(response.userProfile, new TextMessage('Hello ' + response.userProfile.name))
// // });

// bot.onUnsubscribe(userId => console.log(`000000000000000000000000000 Unsubscribed: ${userId} 0000000000000000000000000000`));
// bot.on(BotEvents.MESSAGE_RECEIVED, (message, response) => {
// 	response.send(message);
// });
// bot.onTextMessage(/./, (message, response) =>
//     response.send(new TextMessage(`Hi there ${response.userProfile.name}. I am ${bot.name}`)));

// bot.on(BotEvents.SUBSCRIBED,  response => {
//       console.log(' 00000000000000000000000000 subscribe 00000000000000000000000000');
//       response.send(new TextMessage(`Hi there ${response.userProfile.name}. I am ${bot.name}`))
//     });
// bot.onTextMessage(/^hi|hello$/i, (message, response) =>
//     response.send(new TextMessage(`Hi there ${response.userProfile.name}. I am ${bot.name}`)));



function createLogger() {
  const logger = new winston.Logger({
      level: "debug" // We recommend using the debug level for development
  });
  logger.add(winston.transports.Console, {formatter, timestamp});
  return logger;
}

