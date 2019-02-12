var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const UserSchema = new Schema({
  viberId : String,
  name: { type: String, default: '' },
  viberProfile: String,
  wialoneStatus: {
    type: Boolean,
    default: false
  }
});


// UserSchema.post('findOneAndRemove', function (usr, next) {
//   projectsModel.update(
//     { followers: usr.id },
//     { "$pull": { "followers": usr.id } },
//     { "multi": true });
//   urlsModel.update(
//     { followers: usr.id },
//     { "$pull": { "followers": usr.id } },
//     { "multi": true }, next);
//   monitorModel.update(
//     { followers: usr.id },
//     { "$pull": { "followers": usr.id } },
//     { "multi": true }, next);
// });
const User = mongoose.model('User', UserSchema);
module.exports = User;
