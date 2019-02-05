var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: {type: String, required: true},
  password: { type: String, default: '' }, 
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
