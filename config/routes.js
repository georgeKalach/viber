'use strict';

/**
 * Module dependencies.
 */
const home = require('../app/controllers/home');
const wialons = require('../app/controllers/wialon');
const users = require('../app/controllers/user');
const zohos = require('../app/controllers/zoho');
const BotEvents = require('viber-bot').Events;
const TextMessage = require('viber-bot').Message.Text;

const tests = require('../app/controllers/test');

/**
 * Expose
 */
module.exports = function (app, passport, bot) {

	app.get('/', function(req, res){
		res.render('login')
	});
	app.post('/test', tests.test);

	app.get('/signup', function(req, res){
		res.render('signup')
	});
	app.get('/chat',  function(req, res){
		res.render('./chat')
	});

	app.get('/wialon',  function(req, res){
		res.render('wialon')
	});
	app.post('/wialon',  wialons.wialon);

	app.post('/zoho', zohos.forwardToViber)

	app.get('/auth/getrefresh', zohos.auth)
	app.get('/auth/getcode*', function(req, res){
		res.render('auth')
	})
	app.post('/auth/saveclient', zohos.authGetAuthCode)
	app.post('/auth/accestoken', zohos.getAccesToken)

	bot.on(BotEvents.SUBSCRIBED,  response => {
		users.createUser(response);
		response.send(new TextMessage(`Hi ${response.userProfile.name}. I am ${bot.name}\nPlease write youre phone associated with wialon`))
	});

	bot.onUnsubscribe(userId => {
		users.deleteUser(userId);
		console.log(`Unsubscribed: ${userId}`);
	})
	
	bot.on(BotEvents.MESSAGE_RECEIVED, (message, response) => {
		var userProfile = response.userProfile;
		console.log('Received message from Viber ' + message.text);
		users.receivedMsg(message.text, response, function(err, wialoneStatus){
			if(err) console.log(err);
			
			if(wialoneStatus == 'phone not attached') {
				say(userProfile, "I'm sorry your phone is not attached to device\nPlease call support <number>")
			}
			if(wialoneStatus == 'phone invalid'){
                say(userProfile, "Please enter valid phone nomber")
			}
			if(wialoneStatus == 'more device'){
                say(userProfile, "I'm sorry your phone is not attached more then one device\nPlease call support <number>")
			}
			if(wialoneStatus == 'objects is not found'){
                say(userProfile, "I'm sorry objects is not found\nPlease try in 30 sec")
			}
			if(wialoneStatus === 0){    //status online
				zohos.sendToZoho(message.text, response);
				//bot.sendMessage(userProfile, new TextMessage(message.text));
			}
			if(wialoneStatus === 1){
				say(userProfile, "Please connect to the wialone to continue the dialogue")
			}
		})
	});

	function say(userProfile, msg){
		return bot.sendMessage(userProfile, new TextMessage(msg));
	}

	/**
	 * Error handling
	 */
	app.use(function (err, req, res, next) {
		// treat as 404
		if (err.message
			&& (~err.message.indexOf('not found')
			|| (~err.message.indexOf('Cast to ObjectId failed')))) {
			return next();
		}
		console.error(err.stack);
		// error page
		res.status(500).send('ERROR500'+err);
	});

	// assume 404 since no middleware responded
	app.use(function (req, res, next) {
		res.status(404).send('ERR404');
	});
};