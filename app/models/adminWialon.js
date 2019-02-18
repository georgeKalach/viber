var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const WialonAdmSchema = new Schema({
  name : String
, token : String
, sid : {
    type : String
  , default : ''
  }
, wialonObjs: String        //json obj [{nm, cls, id, mu, uid, uid2, hw, ph, ph2, psw, netconn, uacl}]
, dateSendMsg : {          //json obj {name : 'sys_name', date : Date}
    type: [String]
  , default: []
  }
, createDate : {
    type : Date
  , default : new Date()
  }
});

const WialonAdm = mongoose.model('WialonAdm', WialonAdmSchema);
module.exports = WialonAdm;