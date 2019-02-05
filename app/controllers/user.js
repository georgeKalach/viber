'use strict';

var passport = require("passport");
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var usersModel = require('../models/user');
var salt = bcrypt.genSaltSync(10);

exports.getUser = function(req, res){
    usersModel.findById(req.user.id, function(err, user){
        if (err || !user) return res.sendError('ERR005');
        res.sendData({name : user.name, email : user.email, phone : user.phone});
    })
}

module.exports.registr = function(req, res){
    var hash = bcrypt.hashSync(req.body.password, salt);
    let user = new usersModel({
      name : req.body.name,
      email : req.body.email,
      phone : req.body.phone,
      password : hash
    });

    isExist(user, (err, resultExist) => {
        if(err) return res.sendError('ERR005');
        if(resultExist) return res.sendError('ERR008');

        user.save(function(err){
            if(err) return res.sendError('ERR005')
    
            req.logIn(user, function(err){
                if(err) return res.sendError('ERR007');
                const token = jwt.sign({id : user._id}, 'very_big_secret_key');
                res.setHeader('token', token)
                return res.redirect('./second');
            });
        });
    })
}

function isExist(user, cb){
    var resultExist;
    usersModel.findOne({email : user.email}, (err, result) => {
        if(err) throw err;
        if(result) resultExist = true;
        else resultExist = false;
        cb(err, resultExist);
    })
}

module.exports.login = function(req, res, next){
    passport.authenticate('local', {session : false}, function(err, user){
        if(err || !user) return res.sendError('ERR007');
        req.logIn(user, {session : false}, (err) => {
            if(err) res.sendError('ERR007');
            const token = jwt.sign({id : user._id}, 'very_big_secret_key');
            res.setHeader('token', token)
            res.sendData(user);
            //return res.redirect('/projects/user/' + user.id)
        })
    })    (req, res, next);
}

module.exports.deleteUser = function(req, res){
    var userID = req.user.id;

    projectsModel.find({createdByID : userID}, function(err, projects){
        if(err || !projects) return res.sendError('ERR005');
        
        for(var i = 0; i < projects.length; i++){                                      //del urls
            var urls = projects[i].urls;

            urlsModel.find({_id : { $in : urls}}, function(err, urlObjs){               //del logfiles
                if(err || !urlObjs) console.log('Value was not found');
                urlObs.forEach(function(val){
                    let nameFile = val.address.replace(/[^\w\d]/g, '_');
                    var dirName = __dirname.replace('controllers', 'models');
                    nameFile = `${dirName}/log/${nameFile}.txt`;            
                    fs.access(nameFile, function(err){
                        if(err) console.log('File is not exist');
                        else{
                            fs.unlink(nameFile, function(err){
                                if(err) console.log('Unsuccessful dellition');                
                            })
                        }
                    })
                })
            })
            urlsModel.remove({_id : { $in : urls}}, function(err, result){
                if(err || !result) return res.sendError('ERR005');
            })
        }
        projectsModel.remove({createdByID : userID}, function(err, result){            //del projects
            if(err || !result) return res.sendError('ERR005');
        })
    })
    usersModel.deleteOne({_id : userID}, function(err, result){
        if(err || !result) return res.sendError('ERR005');

        urlsModel.find(function(err, urls){                                 //del fllowers
            if(err || !result) console.log('Value not found');
            urls.forEach(function(url){
                let index = url.follwers.indexOf(userID);
                if(index < 0) return;
                url.follwers.splice(index);
                url.save(function(err){
                    console.log(err);                    
                })
            })
        })
        return res.sendData('Successfully');
    })
}

module.exports.updateUser = function(req, res){
    var objUser = {
        name : req.body.reqData['name']
    ,   email : req.body.reqData['email']
    ,   phone : req.body.reqData['phone']
    }

    usersModel.findOne({_id : req.user.id}, function(err, user){
        if(err || !user) return res.sendError('ERR005');

        user.set(objUser);
        user.save(function(err){
            if(err) return res.sendError('ERR005')
            res.sendData('Successfully')
        })
    })
}



// module.exports.test = function(req, res){
    
//     res.sendData('ok')

    
// }