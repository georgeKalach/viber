'use strict'

const request = require('request');
var usersModel = require('../models/user');
var adminModel = require('../models/adminWialon');
var chatModel = require('../models/chat');
const constants = require('../../config/constants');

//function to send messages to viber
exports.forwardToViber = function(req, res){
	var body = JSON.parse(req.body.message);
    var name = body.name;
    var msg = body.message;
	//console.log(msg)

    usersModel.findOne({wialoneName: name}, function(err, user){
        if(err) return console.log(err);
        if(!user) {
			console.log('User is not exsist');
			//send zoho about use is not exsist
			var url = constants.URL_ZOHO + '/chat'
		
			// var requestWrapper = request.defaults({
			//     headers: {'X-Viber-Auth-Token': constants.VIBER_AUTH}
			// })
			var postData = JSON.stringify({
				"err": 'User is not exsist',
				"name": name,
				"message": 'I\'m sorry but there is no phone number for this object or the user is not registered',
			 })
		
			 request.post(url, {form: {msg: postData}}, function(err, body, res){
				 if(err) console.log(err);
				 var resParse;
				 console.log(res)
			 });
			return;
		}
		//----------- save msg to db -------------
		var lastMsg = user.todayMsg[0] ? JSON.parse(user.todayMsg[user.todayMsg.length -1]) : undefined
		var createDate = new Date();
		if(lastMsg){
			if(lastMsg.name == 'Support'){
				lastMsg.message = lastMsg.message + '\n' + msg;
				lastMsg = JSON.stringify(lastMsg);
				user.todayMsg.pop();
			}else{
				lastMsg = JSON.stringify({name: "Support", message: msg, createDate: createDate});
			}
		}else lastMsg = JSON.stringify({name: "Support", message: msg, createDate: createDate});
		user.todayMsg.push(lastMsg);
		usersModel.findOneAndUpdate({viberId: user.viberId}, {$set: {todayMsg: user.todayMsg}}, function(err){
			if(err) console.log(err);
		})
		
		//-------------------------------------------
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

         requestWrapper.post(url, {form: postData}, function(err, body, response){
             if(err) {
				 console.log(err)
				 var url = constants.URL_ZOHO + '/chat'
		
				// var requestWrapper = request.defaults({
				//     headers: {'X-Viber-Auth-Token': constants.VIBER_AUTH}
				// })
				usersModel.findOne({wialoneName: name}, function(err, user1){
					if(err) return console.log(err);
					if(!user1) return console.log('User is not exsist');
					
					for(let i = user1.todayMsg.length - 1; i >= 0 ; i--){
						var ell = JSON.parse(user1.todayMsg[i]);
						
						if(~ell.message.indexOf('\n')){
							let arr = ell.message.split('\n');
							let index = arr.indexOf(msg);
							if(~index){
								arr.splice(index + 1, 0, 'message not delivered');
								ell.message = arr.join('\n');
							}
						}
						else{
							if(msg == ell.message){
								ell.message = ell.message + '\n' + 'message not delivered';
							}
						}
						user1.todayMsg.splice(i, 1, JSON.stringify(ell));
						user1.save(function(err){
							if(err) return console.log(err);
						})
					}
				})
				var postData = JSON.stringify({
					"err": "ETIMEDOUT",
					"name": name,
					"message": msg,
				 })
			
				 request.post(url, {form: {msg: postData}}, function(err, bodyr, resp){
					 if(err) console.log(err);
				 });
			 }
         });

    })
}

//function to send messages to zoho
exports.sendToZoho = function(mess, response){
	var message = mess + 'noRead'
  var viberId = response.userProfile.id;
  var createDate = new Date();
  usersModel.find(function(err, users){
    if(err) return console.error(err);
    if(!users) return console.log('User is not exsist');
	//------------ find user and collect all msg in one array -------------
	var user;
	var todayAllMsg = [];
	users.forEach(val => {
		if(viberId == val.viberId) {
			user = val;
			return;
		}
		todayAllMsg.push(JSON.stringify({name: val.wialoneName, todayMsg: val.todayMsg}));
	})
	//--------------- save to db new msg --------------------
	var lastMsg = user.todayMsg[0] ? JSON.parse(user.todayMsg[user.todayMsg.length - 1]) : undefined;
	if(lastMsg){
		if(lastMsg.name != 'Support'){
			lastMsg.message = lastMsg.message + '\n' + message;
			lastMsg = JSON.stringify(lastMsg);
			user.todayMsg.pop();
		}else{
			lastMsg = JSON.stringify({name: user.wialoneName, message: message, createDate: createDate});
		}
	}else lastMsg = JSON.stringify({name: user.wialoneName, message: message, createDate: createDate});
	user.todayMsg.push(lastMsg);
	usersModel.findOneAndUpdate({viberId: user.viberId}, {$set: {todayMsg: user.todayMsg}}, function(err){
		if(err) console.log(err);
	})
	//-------------------------------------------
    adminModel.findOne({name: 'admin'}, function(err, admin){
        if(err) return console.error(err);
        if(!admin) return console.log('Admin is not exsist');

			var name = user.wialoneName;
			var wialonObjs = admin.wialonObjs;
			var todayMsg = JSON.stringify({name: user.wialoneName, todayMsg: user.todayMsg});
			todayAllMsg.unshift(todayMsg);
			var url = constants.URL_ZOHO + '/chat'
		
			// var requestWrapper = request.defaults({
			//     headers: {'X-Viber-Auth-Token': constants.VIBER_AUTH}
			// })
			var postData = JSON.stringify({
				"wialonObjs": wialonObjs,      //JSON
				"name": name,
				"message": message,
				"todayAllMsg": todayAllMsg
			 })
		
			 request.post(url, {form: {msg: postData}}, function(err, body, res){
				 if(err) console.log(err);
				 console.log('------- body --------')
				 console.log(body)
				 console.log('------- res --------')
				 console.log(res)
			 });
    })
  })
}

//the function get access token. auth zoho
exports.getAccesToken = function(req, res){
    adminModel.findOne({name:'admin'}, function(err, admin){
        if(err) return console.error(err);
        if(!admin) return console.log('Admin is not exsist');

        var client_id = admin.client_id;
        var client_secret = admin.client_secret;
        var refresh_token = admin.refreshTokenZoho;
        //let redirect = 'https://damp-tundra-61257.herokuapp.com'
        //let scope = 'Desk.tickets.READ,Desk.basic.READ,Desk.tickets.CREATE,Desk.tickets.UPDATE'
        let params = `?refresh_token=${refresh_token}&client_id=${client_id}&client_secret=${client_secret}&grant_type=refresh_token`;
        var url = `https://accounts.zoho.com/oauth/v2/token${params}`;

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

//the function get refresh token. auth zoho
exports.authRefresh = function(req, res, next){
    console.log('/////////////////////////////////////////////');
    
    let code = req.query.code;
    console.log('code = '+code);

    adminModel.findOne({name:'admin'}, function(err, admin){
        if(err) return console.error(err);
        if(!admin) return console.log('Admin is not exsist');
		if(admin.refreshTokenZoho) req.redirect('/');

        var client_id = admin.client_id;
        var client_secret = admin.client_secret;
        let scope = 'Desk.tickets.READ,Desk.basic.READ,Desk.tickets.CREATE,Desk.tickets.UPDATE'
        let redirect = 'https://damp-tundra-61257.herokuapp.com/auth/getrefresh'
        let params = `?code=${code}&grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${redirect}&scope=${scope}`;

        var url = `https://accounts.zoho.com/oauth/v2/token${params}`;

        request.post(url,  function(err, body, response){
            if(err) console.error('////// error post refresh /////////'+err);
            console.log(response);
			var resParse = JSON.parse(response)
            console.log('000000000000000000000 response 00000000000000000000000');
            
        console.log(resParse.access_token);
		console.log(resParse.refresh_token);

            if(response){
                admin.accessTokenZoho = resParse.access_token;
                admin.refreshTokenZoho = resParse.refresh_token;
                admin.save(function(err){
                    if(err)console.error(err);            
                })
            }
            next()
        });
    })
}

//save function client_id && secret. auth zoho
exports.authGetClientId = function(req, res){
    let client_id = req.body.client_id;
    let client_secret = req.body.client_secret;

    adminModel.findOne({name:'admin'}, function(err, admin){
        if(err) return console.error(err);
        if(!admin) return console.log('Admin is not exsist');

        admin.client_id = client_id;
        admin.client_secret = client_secret;
        admin.save(function(err){
            if(err)console.error(err);            
        })
        res.status(200).send('authGetAuthCode');
    })
}

//save function auth_code. auth zoho
exports.authGetAuthCode = function(req, res, next){
    let code = req.query.code;
    console.log('code = '+code);

    adminModel.findOne({name:'admin'}, function(err, admin){
        if(err) return console.error(err);
        if(!admin) return console.log('Admin is not exsist');

        admin.code = code;
        admin.save(function(err){
            if(err)console.error(err);            
        })
		next();
        //res.status(200).send('authGetAuthCode');
    })
}

//the function of sending chat messages when loading
exports.zohoOnload = function(){
  usersModel.find(function(err, users){
    if(err) return console.error(err);
    if(!users) return console.log('User is not exsist');
	//------------ collect all msg in one array -------------
	var todayAllMsg = [];
	users.forEach(val => {
		todayAllMsg.push(JSON.stringify({name: val.wialoneName, todayMsg: val.todayMsg}));
	})
	//-------------------------------------------
    adminModel.findOne({name: 'admin'}, function(err, admin){
        if(err) return console.error(err);
        if(!admin) return console.log('Admin is not exsist');
		
		var wialonObjs = admin.wialonObjs;
		var url = constants.URL_ZOHO + '/chat'
	
		// var requestWrapper = request.defaults({
		//     headers: {'X-Viber-Auth-Token': constants.VIBER_AUTH}
		// })
		var postData = JSON.stringify({
			"wialonObjs": wialonObjs,      //JSON
			"todayAllMsg": todayAllMsg,
			"name": "jorjTest"
		 })
	
		 request.post(url, {form: {msg: postData}}, function(err, body, res){
			 if(err) console.log(err);
			 var resParse;
			 console.log(res)
		 });
    })
  })
}

//the function of changing the status of messages "read"
exports.zohoSaveRead = function(req, res){
    var name = req.body.msg['name'];
	
  usersModel.findOne({wialoneName: name}, function(err, user){
    if(err) return console.error(err);
    if(!user) return console.log('User is not exsist');
	
	for(let i = user.todayMsg.length - 1; i >= 0; i--){
		console.log(user.todayMsg[i])
		if(~user.todayMsg[i].indexOf('noRead')){
			user.todayMsg[i] = user.todayMsg[i].replace(/noRead/g, 'readxx');
			console.log('---------------'+user.todayMsg[i])
		}else break;
		
	}
	usersModel.findOneAndUpdate({viberId: user.viberId}, {$set: {todayMsg: user.todayMsg}}, function(err){
		if(err) console.log(err);
	})
	// user.save(function(err){
		// if(err) return console.error(err);
		// console.log('0000000000000000')
	// })
  })
}