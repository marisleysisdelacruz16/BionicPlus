// set up Express
var express = require('express');
var app = express();

// set up BodyParser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// import the classes
var Course = require('./Courses.js');
var Class = require('./Classes.js');

/***************************************/

// endpoint for showing all the courses
app.use('/all', (req, res) => {

	Course.find( {}, (err, courses) => {
		if (err) {
		    res.type('html').status(200);
		    console.log('uh oh' + err);
		    res.write(err);
		}
		else {
		    if (courses.length == 0) {
			res.type('html').status(200);
			res.write('There are no courses');
			res.end();
			return;
		    }
		    else {
			res.type('html').status(200);
			res.write('Here are the courses in the database:');
			res.write('<ul>');
			// show all the people
			courses.forEach( (course) => {
			    res.write('<li>');
			    res.write('Name: ' + course.name + '; description: ' + course.description);
			    // this creates a link to the /delete endpoint
			    res.write(" <a href=\"/delete?name=" + course.name + "\">[Delete]</a>");
			    res.write('</li>');

			});
			res.write('</ul>');
			res.end();
		    }
		}
	    }).sort({ 'name': 'asc' }); // this sorts them BEFORE rendering the results
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
