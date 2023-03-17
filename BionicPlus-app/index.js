// set up Express
var express = require('express');
var app = express();
// set up BodyParser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// import the classes
//var Course = require('./Courses.js');
//var Class = require('./Classes.js');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var courseSchema = new Schema({
	name: {type: String, required: true, unique: true},
	department: String,
	level: String,
	description: String
    });


/***************************************/
app.use('/create', async (req, res) => {
    try {
        mongoose.connect('mongodb://localhost:27017').then(() => {
            console.log("Connected");
            const Course = mongoose.model('Courses', courseSchema);
	// construct the Person from the form data which is in the request body
            const newCourse = new Course ({
                name: req.body.name,
                department: req.body.department,
                level: "",
                description: ""
                });

        // save the person to the database
            const found = newCourse.save({});
            res.send(found);
        })
        }
        catch(err){
            console.log(err);
        }
        }
    );


app.use('/test', async (req, res) => {
   try {
        await mongoose.connect('mongodb://localhost:27017').then(() => {
            console.log("Connected");
            const Course = mongoose.model('Courses', courseSchema);
            const courses = Course.find({ });
            console.log(courses.length)
            res.send(courses.length)
            }).catch((err) => {
                console.log("Not Connected: ", err);
            });
        //res.send("success")
    } catch (err) {
        console.log(err);
    }
});
// endpoint for showing all the courses
app.use('/all', async (req, res) => {
   /* async function run() {
      await mongoose.connect('mongodb://127.0.0.1:27017');
      mongoose.model('Course', courseSchema);

      await mongoose.model('Course').find(); // Works!
    }*/
   try {
        await mongoose.connect('mongodb://localhost:27017').then(() => {
            console.log("Connected");
            }).catch((err) => {
                console.log("Not Connected: ", err);
            });
        const Course = mongoose.model('courses', courseSchema, 'courses');
        const courses = await Course.find({ });
        if (courses.length == 0){
            res.send("no courses");
        }
        res.send(courses);
        console.log(courses);
    } catch (err) {
        console.log(err);
    }
});


// IMPLEMENT THIS ENDPOINT!
app.use('/delete', (req, res) => {
    res.redirect('/all');
});



// endpoint for accessing data via the web api
// to use this, make a request for /api to get an array of all Person objects
// or /api?name=[whatever] to get a single object
app.use('/api', (req, res) => {
	// construct the query object
	var queryObject = {};
	if (req.query.name) {
	    // if there's a name in the query parameter, use it here
	    queryObject = { "name" : req.query.name };
	}
    
	Course.find( queryObject, (err, courses) => {
		console.log(courses);
		if (err) {
		    console.log('uh oh' + err);
		    res.json({});
		}
		else if (courses.length == 0) {
		    // no objects found, so send back empty json
		    res.json({});
		}
		else if (courses.length == 1 ) {
		    var course = courses[0];
		    // send back a single JSON object
		    res.json( { "name" : course.name , "age" : course.age } );
		}
		else {
		    // construct an array out of the result
		    var returnArray = [];
		    courses.forEach( (course) => {
			    returnArray.push( { "name" : course.name, "description" : course.description } );
			});
		    // send it back as JSON Array
		    res.json(returnArray); 
		}
		
	    });
    });




/*************************************************/

app.use('/public', express.static('public'));

app.use('/', (req, res) => { res.redirect('/public/personform.html'); } );

app.listen(3000,  () => {

	console.log('Listening on port 3000');
    });
