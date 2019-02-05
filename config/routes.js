'use strict';

/**
 * Module dependencies.
 */
const home = require('../app/controllers/home');
const users = require('../app/controllers/user');
//const index = require('../public')
const fs = require('fs');
//const router = express.Router()


/**
 * Expose
 */
module.exports = function (app, passport) {

	app.get('/', function(req, res){
		res.render('login')
	});
	app.get('/signup', function(req, res){
		res.render('signup')
	});
	app.get('/chat',  function(req, res){

		res.render('./chat')
	});

	app.post('/registr', users.registr);
	app.post('/login', users.login);
	app.delete('/user/delete/', passport.authenticate('jwt', {session : false}), users.deleteUser);
	app.post('/user/update/', passport.authenticate('jwt', {session : false}), users.updateUser);
	app.get('/user/get/', passport.authenticate('jwt', {session : false}), users.getUser);

	//app.get('/', home.index);
	// app.get('/', function(req, res){
	// 	let filePath = req.url.substr(1);
	// 	console.log('/////////////////'+filePath);
		
	// 	fs.readFile(filePath, function(error, data){
    //         if(error){
    //             res.statusCode = 404;
    //             res.end("Resourse not found!");
    //         }   
    //         else{
    //             res.setHeader("Content-Type", "text/html");
    //             res.end(data);
	// 		}
	// 	})
	// });

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
		res.status(500).sendError('ERR500');
	});

	// assume 404 since no middleware responded
	app.use(function (req, res, next) {
		res.status(404).sendError('ERR404');
	});
};