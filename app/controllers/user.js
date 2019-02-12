'use strict';

var usersModel = require('../models/user');

exports.createUser = function(res){
    usersModel.findOne({viberId : res.userProfile.id}, function(err, obj){
        if(err) console.log(err);
        if(obj) return console.log('obj is Exist');
        var newObj = {
            viberId : res.userProfile.id
        ,   name : res.userProfile.name
        ,   viberProfile : JSON.stringify(res.userProfile)
        }
        usersModel.create(newObj).catch(err => console.error(err));
    })
}

module.exports.deleteUser = function(userId){
    usersModel.findOne({viberId: userId}, function(err, obj){
        if(err) console.log(err);
        if(!obj) {
            console.log('Obj is not Exist');
            return;
        }
        usersModel.deleteOne({viberId: userId}, function(err, result){
            if(err) console.log(err);
            else console.log('Delete Successfuly');
            
        })
    })
}

exports.receivedMsg = function(res, wialoneStatus){
    var viberId = res.userProfile.id;
    usersModel.findOne({viberId : viberId}, function(err, obj){
        if(err)  console.log(err);
        if(!obj) {
            console.log('Object is not Exist');
            return;
        }
        wialoneStatus(err, obj.wialoneStatus)
    })
}