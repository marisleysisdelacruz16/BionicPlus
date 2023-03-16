var mongoose = require('mongoose');

// the host:port must match the location where you are running MongoDB
// the "myDatabase" part can be anything you like
mongoose.connect('mongodb://localhost:27017/myDatabase');

var Schema = mongoose.Schema;

var classSchema = new Schema({
	courseNumber: {type: String, required: true, unique: true},
	days: Array,
	domain: String,
	majorRequirement: Boolean,
	prof: String,
	rating: Number,
	semester: String,
	time: String
    });

module.exports = mongoose.model('Class', classSchema);

classSchema.methods.standardizeName = function() {
    this.name = this.name.toLowerCase();
    return this.name;
}
