'use strict'
var usersModel = require('../models/user');
const request = require('request')

exports.test = function(req, res){
    var status = req.body.status;


    // usersModel.findOneAndUpdate({phone: '9608676746'}, { $set: {wialoneStatus: status}}, function(err, user){
    //     if(err) return res.status(400);
    //     if(!user) return console.log('User not found');
    //     console.log('0000000000000000 ' + user.wialoneStatus);
        
    //     res.status(200)
    // })
    if(status == 1){
    var url = 'https://desk.zoho.com/api/v1/tickets?include=contacts,assignee,departments,team,isRead'
    
    var requestWrapper = request.defaults({
        headers: {
            "orgId":2389290 ,
            "Authorization": "Zoho-oauthtoken 1000.67013ab3960787bcf3affae67e649fc0.83a789c859e040bf11e7d05f9c8b5ef6"
        }
    })
    // var postData = JSON.stringify({
    //     "wialonObjs": wialonObjs,      //JSON
    //     "name": name,
    //     "phone": phone,
    //     "message": message,
    //  })

    requestWrapper.get(url, function(err, body, res){
         if(err) console.log(err);
         console.log(res)
     });
    }

    if(status == 2){
        var url = 'https://desk.zoho.com/api/v1/tickets?include=contacts,assignee,departments,team,isRead'
        
        var requestWrapper = request.defaults({
            headers: {
                "orgId":2389290 ,
                "Authorization": "Zoho-oauthtoken 1000.67013ab3960787bcf3affae67e649fc0.83a789c859e040bf11e7d05f9c8b5ef6"
            }
        })
        // var postData = JSON.stringify({
        //     "wialonObjs": wialonObjs,      //JSON
        //     "name": name,
        //     "phone": phone,
        //     "message": message,
        //  })
    
        requestWrapper.get(url, function(err, body, res){
             if(err) console.log(err);
             console.log(res)
         });
        }

}