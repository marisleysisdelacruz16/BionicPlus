const { appendFile } = require('fs');
var mongoose = require('mongoose');


// the host:port must match the location where you are running MongoDB
// the "myDatabase" part can be anything you like
mongoose.connect('mongodb://127.0.0.1:27017/coursesDatabase');

var Schema = mongoose.Schema;
var Class = require('./Classes.js');

var courseSchema = new Schema({
	name: {type: String, required: true, unique: true}, 
	department: String,
	level: String,
	domain: String,
	majorRequirement: Boolean,
	description: String,
	classList: Array,
	crossList: {type: String, default: 'none'}
});

// export courseSchema as a class called Course
module.exports = mongoose.model('Course', courseSchema);

courseSchema.methods.standardizeName = function() {
    this.name = this.name.toLowerCase();
    return this.name;
}

//const courseCollection = new mongoose.model("courseCollection",courseSchema);
//module.exports = courseCollection;

/*
var classSchema = new Schema({
	courseNumber: {type: String, required: true, unique: true},
	days: Array,
	prof: String,
	semester: String,
	time: String,
	courseID: String
    });

module.exports = mongoose.model('Class', classSchema);

classSchema.methods.standardizeName = function() {
    this.name = this.name.toLowerCase();
    return this.name;
}

*/