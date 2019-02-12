var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const WialonAdmSchema = new Schema({
  name : String
, token : String
, sid : {
    type : String
  , default : ''
  }
, createDate : {
    type : Date
  , default : new Date()
  }
});

const WialonAdm = mongoose.model('WialonAdm', WialonAdmSchema);
module.exports = WialonAdm;