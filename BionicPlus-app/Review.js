var mongoose = require('mongoose');

// the host:port must match the location where you are running MongoDB
// the "myDatabase" part can be anything you like
//mongoose.connect('mongodb://127.0.0.1:27017:27017/myDatabase');


//Class review schema has a title, author, date, content, rating, and comments thread.
var reviewSchema = new mongoose.Schema({
  title: String,
  content: String,
  rating: {
    type: Number,
    // required: true,
    min: 1,
    max: 5
  },
	commentsThread: Array
    });

module.exports = mongoose.model('Review', reviewSchema);
