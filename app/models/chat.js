var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const zohoChat = new Schema({
  name : String
, archive: {                      //json [{msg: 'msg'}]
	type: Array
  , default: []
  }     
, todayMsg: {                      //json [{msg: 'msg'}]
	type: Array
  , default: []
  }     
});

const ZohoChat = mongoose.model('ZChat', zohoChat);
module.exports = ZohoChat;