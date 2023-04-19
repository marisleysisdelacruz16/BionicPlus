var mongoose = require('mongoose');

// the host:port must match the location where you are running MongoDB
// the "myDatabase" part can be anything you like
//mongoose.connect('mongodb://127.0.0.1:27017:27017/myDatabase');


//Schedule schema has just a list of classes.
var scheduleSchema = new mongoose.Schema({
    scheduleName: String,
	classList : Array
    });

module.exports = mongoose.model('Schedule', scheduleSchema);

