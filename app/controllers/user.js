'use strict';

var usersModel = require('../models/user');
var wialons = require('./wialon')

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

exports.updateUser = function(param, res){
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

exports.receivedMsg = function(message, res, wialoneStatus){
    var viberId = res.userProfile.id;
    usersModel.findOne({viberId : viberId}, function(err, user){
        if(err)  console.log(err);
        if(!user) {
            console.log('Object is not Exist');
            return;
        }
        var phone;
        if(!user.phone) {
            phone = message.replace(/[^\d]/g, '');

            if(!phone) return wialoneStatus(null, 'phone invalid');
            if(phone.length >= 10 && phone.length <= 13){               // check msg may be phone
                phone = phone.substring(phone.length - 10);
            }else{
                return wialoneStatus(null, 'phone invalid')
            }
        }
        else{
            phone = user.phone;
        }
        wialons.getObjWialon(function(err, objects){
            if(!objects) {
                wialoneStatus(null, 'objects is not find')
                return console.log('getObjWialon return empty');
            }

            var count = 0;
            var countDevice = 0
            var objDevice;
            for(var i = 0; i < objects.length; i++){
                var wialonPhone = objects[i].ph
                if(wialonPhone) wialonPhone = wialonPhone.substring(wialonPhone.length - 10);
                if(phone == wialonPhone){
                    countDevice++;
                    objDevice = objects[i];
                    continue;
                }else count++;
            }
            if(count == objects.length){
                return wialoneStatus(null, 'phone not attached')
            }
            if(countDevice > 1){
                return wialoneStatus(null, 'more device')
            }
            if(countDevice == 1){
                user.phone = phone.substring(phone.length - 10);
                user.save(function(err){
                    if(err) console.log(err);                    
                })
                console.log(objDevice);
                
                wialoneStatus(null, objDevice.netconn);
                return;
            }
        })
    })
}