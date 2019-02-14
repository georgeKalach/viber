'use strict'
var wialonAdmShema = require('../models/adminWialon')
const request = require('request');


exports.wialon = function(req, res){
    var token = req.body.token;
    wialonAdmShema.findOneAndUpdate({name : 'admin'}, {token : token}, function(err, obj){
        if(err) return console.error(err);
        if(!obj) return console.error('Obj is not found');
        res.sendStatus(200);
    })
}

exports.wialonCreate = function(name, token){
    wialonAdmShema.findOne({name : 'admin'}, function(err, obj){
        if(err) return console.error(err);
        if(obj) return console.log('Obj is exist');
        wialonAdmShema.create({name : name, token : token}, function(err, result){
            if(err) console.error(err);
            else console.log('admin created');            
        })
    })
}

exports.getObjWialon = function(callback){
    wialonAdmShema.findOne({name : 'admin'}, function(err, obj){
        if(err) return console.error(err);
        if(!obj) return console.log('Obj is not exsist');
        
        var token = obj.token;
        var sid = obj.sid;
        var host = 'http://hst-api.wialon.com';
        var params = JSON.stringify({"spec":{
            "itemsType": "avl_unit",	
            "propName": "sys_name",	
            "propValueMask":"*",	
            "sortType": "sys_name",
            "propType": "list",
             },
             "force": 1,			
             "flags": 1 | 2097152 | 256,		
             "from": 0,			
             "to": 0
        })
        //var url = `${host}/avl_evts?sid=${sid}`;
        var url = `${host}/wialon/ajax.html?sid=${sid}&svc=core/search_items&params=${params}`;

        request(url, function(err, res, body){
          if(err) return console.error(err);
          if(~body.indexOf('"error":1')){

            let urlSid = `${host}/wialon/ajax.html?svc=token/login&params={"token":"${token}"}`;
            request(urlSid, function(err, resSid, bodySid){            //get new sid
              if(err) return console.error(err);          
              obj.sid = JSON.parse(bodySid).eid;
              obj.save(function(err){
                if(err) console.error(err);
              })
            })
            
          }
          callback(err, JSON.parse(body).items)
        })
      })
}