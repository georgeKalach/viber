var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const UserSchema = new Schema({
  viberId : String,
  name: { type: String, default: '' },
  viberProfile: String,
  phone : Number,
  wialoneName: String,
  wialoneStatus: {
    type: Number,
    default: 0
  },
  createDate : {
    type : Date
  , default : new Date()
  }
, archive: {                      //json [{name: 'msg'}]
	type: Array
  , default: []
  }     
, todayMsg: {                      //json [{name, message, createDate}]
	type: Array
  , default: []
  }    
});


const User = mongoose.model('User', UserSchema);
module.exports = User;
