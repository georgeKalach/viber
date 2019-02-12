'use strict';

/**
 * Module dependencies.
 */
const home = require('../app/controllers/home');
const wialons = require('../app/controllers/wialon');
const users = require('../app/controllers/user');
const BotEvents = require('viber-bot').Events;
const TextMessage = require('viber-bot').Message.Text;


/**
 * Expose
 */
module.exports = function (app, passport, bot) {

	app.get('/', function(req, res){
		res.render('login')
	});
	app.get('/lol', function(req, res){             //del
		//wialons.wialon(req, res)
		res.render('login')
	});
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

	bot.on(BotEvents.SUBSCRIBED,  response => {
		users.createUser(response);
		response.send(new TextMessage(`Hi there ${response.userProfile.name}. I am ${bot.name}`))
	});

	bot.onUnsubscribe(userId => {
		users.deleteUser(userId);
		console.log(`Unsubscribed: ${userId}`);
	})
	
	bot.on(BotEvents.MESSAGE_RECEIVED, (message, response) => {
		users.receivedMsg(response, function(err, wialoneStatus){
			if(err){
				console.log(err);
				return;
			}
			if(wialoneStatus){
	// message send to zoho
				bot.sendMessage(response.userProfile, new TextMessage(message.text));
			}
			else{
				bot.sendMessage(response.userProfile, new TextMessage("Please go to the wialone to continue the dialogue"));
			}
		})
	});

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
		res.status(500).send('ERR500');
	});

	// assume 404 since no middleware responded
	app.use(function (req, res, next) {
		res.status(404).send('ERR404');
	});
};