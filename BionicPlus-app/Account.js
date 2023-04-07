var mongoose = require('mongoose');

// the host:port must match the location where you are running MongoDB
// the "myDatabase" part can be anything you like
//mongoose.connect('mongodb://127.0.0.1:27017:27017/myDatabase');


//Account schema has a username, password, and list of schedules
var accountSchema = new mongoose.Schema({
	username: {type: String, required: true, unique: true},
	password: String,
	scheduleList : Array
    });

module.exports = mongoose.model('Account', accountSchema);

accountSchema.methods.standardizeName = function() {
    this.name = this.name.toLowerCase();
    return this.name;
}
