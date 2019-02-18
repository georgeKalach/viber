'use strict'

const request = require('request');
var usersModel = require('../models/user');
var adminModel = require('../models/adminWialon');
const constants = require('../../config/constants');

exports.forwardToViber = function(req, res){
	var body = JSON.parse(req.body.message);
    var phone = body.phone;
    var msg = body.message;

    usersModel.findOne({phone: phone}, function(err, user){
        if(err) return console.log(err);
        if(!user) return console.log('User is not exsist');
        
        var viberId = user.viberId;
        var url = 'https://chatapi.viber.com/pa/send_message';
        var requestWrapper = request.defaults({
            headers: {'X-Viber-Auth-Token': constants.VIBER_AUTH}
        })
        var postData = JSON.stringify({
            "receiver": viberId,
            "min_api_version":1,
            "sender":{
               "name":"Support",
               "avatar":"http://avatar.example.com"
            },
            "type":"text",
            "text": msg
         })

         requestWrapper.post(url, {form: postData}, function(err, body, res){
             if(err) console.log(err);
             var resParse;
             if(res) resParse = JSON.parse(res);
             if(resParse.status == 4) return console.log('Message not send');
			 if(resParse.status == 2) return console.log('Missing auth token');
         });

    })
}

exports.sendToZoho = function(message, response){
  var viberId = response.userProfile.id;

  usersModel.findOne({viberId: viberId}, function(err, user){
    if(err) return console.error(err);
    if(!user) return console.log('User is not exsist');

    adminModel.findOne({name: 'admin'}, function(err, admin){
        if(err) return console.error(err);
        if(!admin) return console.log('Admin is not exsist');

        var phone = user.phone;
        var name = user.wialoneName;
        var wialonObjs = admin.wialonObjs;
        var url = 'http://localhost:5000/chat'
    
        // var requestWrapper = request.defaults({
        //     headers: {'X-Viber-Auth-Token': constants.VIBER_AUTH}
        // })
        var postData = JSON.stringify({
            "wialonObjs": wialonObjs,      //JSON
            "name": name,
            "phone": phone,
            "message": message,
         })
    
         request.post(url, {form: {msg: postData}}, function(err, body, res){
             if(err) console.log(err);
             var resParse;
             console.log(res)
         });
    })
  })
}