var mongoose = require('mongoose');

// the host:port must match the location where you are running MongoDB
// the "myDatabase" part can be anything you like
mongoose.connect('mongodb://localhost:27017/coursesDatabase');

var Schema = mongoose.Schema;

var courseSchema = new Schema({
	name: {type: String, required: true, unique: true},
	department: String,
	level: String,
	description: String
    });

// export courseSchema as a class called Course
module.exports = mongoose.model('Course', courseSchema);

courseSchema.methods.standardizeName = function() {
    this.name = this.name.toLowerCase();
    return this.name;
}
