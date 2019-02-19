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

exports.getAccesToken = function(req, res){
    adminModel.findOne({name:'admin'}, function(err, admin){
        if(err) return console.error(err);
        if(!admin) return console.log('Admin is not exsist');

        var client_id = admin.client_id;
        var client_secret = admin.client_secret;
        var refresh_token = admin.refreshTokenZoho;
        let redirect = 'https://damp-tundra-61257.herokuapp.com'
        let scope = 'Desk.tickets.READ,Desk.basic.READ,Desk.tickets.CREATE,Desk.tickets.UPDATE'
        let params = `?refresh_token=${refresh_token}&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect}&scope=${scope}&grant_type=refresh_token`;
        var url = `https://accounts.zoho.com/oauth/v2/auth${params}`;

        request.post(url, function(err, body, res){
            if(err) console.log(err);
            console.log(body);
            
            console.log(res)

            if(body){
                admin.accessTokenZoho = body.access_token;
                admin.save(function(err){
                    if(err)console.error(err);            
                })
            }
        });
    })
}

exports.auth = function(req, res){
    let code = req.query.code;
    console.log('code = '+code);

    adminModel.findOne({name:'admin'}, function(err, admin){
        if(err) return console.error(err);
        if(!admin) return console.log('Admin is not exsist');

        var client_id = admin.client_id;
        var client_secret = admin.client_secret;
        let scope = 'Desk.tickets.READ,Desk.basic.READ,Desk.tickets.CREATE,Desk.tickets.UPDATE'
        let redirect = 'https://damp-tundra-61257.herokuapp.com'
        let params = `?code=${code}&grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect}&scope=${scope}`;

        var url = `https://accounts.zoho.com/oauth/v2/auth${params}`;

        request.post(url, function(err, body, res){
            if(err) console.log(err);
            //console.log(body);
console.log(body.access_token);
console.log(body.refresh_token);

            if(body){
                admin.accessTokenZoho = body.access_token;
                admin.refreshTokenZoho = body.refresh_token;
                admin.save(function(err){
                    if(err)console.error(err);            
                })
            }
            res.redirect('/');
        });
    })
}

exports.authGetAuthCode = function(req, res){
    let client_id = req.body.client_id;
    let client_secret = req.body.client_secret;
    console.log('client_id = '+client_id + '   ' + 'client_secret = '+client_secret);

    adminModel.findOne({name:'admin'}, function(err, admin){
        if(err) return console.error(err);
        if(!admin) return console.log('Admin is not exsist');

        admin.client_id = client_id;
        admin.client_secret = client_secret;
        admin.save(function(err){
            if(err)console.error(err);            
        })
        res.status(200);
    })
}