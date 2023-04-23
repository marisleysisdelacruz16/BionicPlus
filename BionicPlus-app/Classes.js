var mongoose = require('mongoose');

// the host:port must match the location where you are running MongoDB
// the "myDatabase" part can be anything you like
//mongoose.connect('mongodb://127.0.0.1:27017:27017/myDatabase');

var Schema = mongoose.Schema;

var classSchema = new Schema({
	courseNumber: {type: String, required: true, unique: true},
	days: String,
	prof: String,
	semester: String,
	time: String,
	courseId: String
    });

module.exports = mongoose.model('Class', classSchema);
// const Model = mongoose.model('Class', classSchema);
// const doc = new Model(); 
// console.log(doc._id instanceof mongoose.Types.ObjectId); // true

classSchema.methods.standardizeName = function() {
    this.name = this.name.toLowerCase();
    return this.name;
}
