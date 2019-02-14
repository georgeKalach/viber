var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const UserSchema = new Schema({
  viberId : String,
  name: { type: String, default: '' },
  viberProfile: String,
  phone : Number,
  previousWialonStatus : {
    type : Number,
    default : 0
  },
  wialoneStatus: {
    type: Number,
    default: 0
  },
  createDate : {
    type : Date
  , default : new Date()
  }
});


const User = mongoose.model('User', UserSchema);
module.exports = User;
