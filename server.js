'use strict';

require('dotenv').config();

const fs = require('fs');
const join = require('path').join;
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const config = require('./config');
var wialons = require('./app/controllers/wialon')
var usersModel = require('./app/models/user');
var wialonAdmShema = require('./app/models/adminWialon')
const models = join(__dirname, 'app/models');
const async = require('async')
const port = process.env.PORT || 3000;
const constants = require('./config/constants');

const app = express();
mongoose.Promise = require('bluebird');
const connection = connect();

const webhookUrl = 'https://damp-tundra-61257.herokuapp.com/';
const ViberBot  = require('viber-bot').Bot;

var winston = require('winston');
const toYAML = require('winston-console-formatter');
const { formatter, timestamp } = toYAML();
const logger = createLogger();

const bot = new ViberBot(logger, {
  authToken: constants.VIBER_AUTH, 
  name: "Support",  
  avatar: `./public/img/avatar.jpg` 
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

var SocketServer = new require('ws');
var clients = {};


function listen() {
  if (app.get('env') === 'test') return;
  var server = app.listen(port, () => bot.setWebhook(webhookUrl));
  console.log('Express app started on port ' + port);
  wialons.wialonCreate('admin', '');

  var webSocketServer = new SocketServer.Server({
    server: server
  });

  webSocketServer.on('connection', function(ws) {

    var id = Math.random();
    clients[id] = ws;
    console.log("новое соединение " + id);

    ws.on('message', function(message) {
      console.log('получено сообщение ' + message);

      for (var key in clients) {
        clients[key].send(message);
      }
    });

    ws.on('close', function() {
      console.log('соединение закрыто ' + id);
      delete clients[id];
    });

  });
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

//update token
scheduler.scheduleJob('*/50 * * * *', function(){
  wialonAdmShema.findOne({name: 'admin'}, function(err, admin) {
    if(err) console.error(err);
    if(!admin) console.log('user is not found');
    
//to do // request
  })
})

//update list wialon obj and check status
scheduler.scheduleJob('*/60 * * * * *', function(){
  wialons.getObjWialon(function(err, wialonObjs){
    if(!wialonObjs) return console.log('getObjWialon return empty');
    
    usersModel.find(function(err, userObjs){
      if(err) return console.log(err);
      if(!userObjs[0]) return console.error('Users not find');

        async.waterfall([
          function(callback){    //remove the object if it dose not exist in the wialon
            wialonAdmShema.findOne({name : 'admin'}, function(err, admin){
              if(err) return console.log(err);

              if(admin.dateSendMsg[0]){
                for(var j = 0; j < admin.dateSendMsg.length; j++){
                  var valParse = JSON.parse(admin.dateSendMsg[j]);
                  for(var i = 0; i < wialonObjs.length; i++){
                    if(valParse.name == wialonObjs[i].nm){
                      break;
                    }
                  }
                  if(i == wialonObjs.length){
                    admin.dateSendMsg.splice(j, 1);
                    admin.save(function(err){
                      if(err)console.log(err);   
                    })
                    break;
                  }
                }
              }
              callback(null, admin)
            })
          },
          function(admin, callback){          //check and save wialon status
            for(var i = 0; i < wialonObjs.length; i++){
              var wialonPhone = wialonObjs[i].ph;

              if(wialonPhone) {  //check status if phone exist to wialon
                wialonPhone = wialonPhone.substring(wialonPhone.length - 10);
        //status change check
                for(var j = 0; j < userObjs.length; j++){
                  var userPhone = userObjs[j].phone;

                  if(wialonPhone == userPhone){
                    if(wialonObjs[i].netconn > userObjs[j].wialoneStatus){
                      userObjs[j].wialoneStatus = wialonObjs[i].netconn;
                      userObjs[j].save(function(err){
                        if(err) return console.log(err);
                        console.log('userObjs[j].previousWialonStatus = ' + userObjs[j].wialoneStatus);
          // to do //send to zoho msg about user online
                        
                      }); 
                    }
                    if(wialonObjs[i].netconn < userObjs[j].wialoneStatus){
                      userObjs[j].wialoneStatus = wialonObjs[i].netconn;
                      userObjs[j].save(function(err){
                        if(err) return console.log(err);
                      }); 
                    }
                    break;
                  }
                }
              }
              if(!wialonPhone){  //if phone not exist send msg to zoho (once every two days)
                phoneNotExsist(admin, wialonObjs[i], function(err){
                  if(err) console.log(err);                  
                })           
              }
            }
            callback(null, 'ok')
          }
        ],function(err, result){
          if(err) console.log(err);
          else console.log(result)
        })
    })
  })
})

function phoneNotExsist(admin, wialonObj, cb){
  if(!admin.dateSendMsg[0]) {
    admin.dateSendMsg = [JSON.stringify({name : wialonObj.nm, date : new Date()})];
    admin.save(function(err){
      if(err) console.log(err);
    })
    return cb(0);
  }
  var dateSendMsg = admin.dateSendMsg;  // [{name, date}]

  for(var k = 0; k < dateSendMsg.length; k++){
    var objSendParse = JSON.parse(dateSendMsg[k]);
    var nowDate = new Date().getTime();
    var sendDate = new Date(objSendParse.date).getTime();
    var deltaDay = Math.floor((nowDate - sendDate) / 1000/60/60/24);
    
    if(wialonObj.nm == objSendParse.name){         //send one letter per two day
      if(deltaDay >= 2){
//to do // here send to zoho about field empty               
console.log('here send to zoho about field empty');

        objSendParse.date = new Date();
        dateSendMsg[k] = JSON.stringify(objSendParse);
        admin.dateSendMsg = dateSendMsg;
        admin.save(function(err){
          if(err) console.log(err);
        })
      }
      break;
    }
  }
  if(k == dateSendMsg.length){        //if not found then add obj
    dateSendMsg.push(JSON.stringify({name : wialonObj.nm, date : new Date()}));
//to do // here send to zoho about field empty               
console.log('here send to zoho about field empty');

    admin.dateSendMsg = dateSendMsg;
    console.log(admin.dateSendMsg);
    admin.save(function(err){
      if(err) console.log(err);
    })
  }
  cb(null)
}
