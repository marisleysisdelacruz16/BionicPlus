// set up Express
var express = require('express');
var app = express();
// set up BodyParser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// import the classes
var Course = require('./Courses.js');
var Class = require('./Classes.js');
var mongo = require('mongodb');
const { db } = require('./Classes.js');
//var mongoose = require('mongoose');
//var Schema = mongoose.Schema;

/* var courseSchema = new Schema({
	name: {type: String, required: true, unique: true},
	department: String,
	level: String,
	domain: String,
	majorRequirement: Boolean,
	description: String,
	classList: Array,
	ID: String
});
 */


/***************************************/

app.use('/createCourse', (req, res) => {
	// construct the Course from the form data which is in the request body
	var newCourse = new Course ({
		name: req.body.name,
		department: req.body.department,
		level: req.body.level,
		description: req.body.description,
		domain: req.body.domain,
		majorRequirement: req.body.majorRequirement,
		//Id currently set to 0000 for everything for testing; figuring out how to make objectID() work at the moment.
		ID: "0000",
		classList : []
	    });

	// save the course to the database
	newCourse.save( (err) => {
		if (err) {
		    res.type('html').status(200);
		    res.write('uh oh: ' + err);
		    console.log(err);
		    res.end();
		}
		else {
		    // display the "successfull created" message
		    res.send('successfully added ' + newCourse.name + ' to the database');
		}
	    } );
    }
    );

// app.use('/test', async (req, res) => {
//    try {
//         await mongoose.connect('mongodb://localhost:27017').then(() => {
//             console.log("Connected");
//             const Course = mongoose.model('Courses', courseSchema);
//             const courses = Course.find({ });
//             console.log(courses.length)
//             res.send(courses.length)
//             }).catch((err) => {
//                 console.log("Not Connected: ", err);
//             });
//         res.send("success")
//     } catch (err) {
//         console.log(err);
//     }
// }); 
// endpoint for showing all the courses
app.use('/allCourses', (req, res) => {

	// find all the Person objects in the database
	Course.find( {}, (err, courses) => {
		if (err) {
		    res.type('html').status(200);
		    console.log('uh oh' + err);
		    res.write(err);
		}
		else {
		    if (courses.length == 0) {
			res.type('html').status(200);
			res.write('There are no courses to display');
			res.end();
			return;
		    }
		    else {
			res.type('html').status(200);
			res.write('Here are the courses in the database:');
			res.write('<ul>');
			// show all the courses
			courses.forEach( (course) => {
			    res.write('<li>');
			    res.write('Name: ' + course.name + '; department: ' + course.department + '; level: ' + course.level + '; domain: ' + course.domain)
			if (course.majorRequirement){

			res.write('Required for Major');

			}
			else{
			res.write('Elective');
			}
			res.write('Description: ' + course.description);

			// this creates a link to the /updateCourseView endpoint
			    res.write(" <a href=\"/updateCourseView?name=" + course.name + "\">[EditCourse]</a>");
			    res.write('</li>');
			    // this creates a link to the /deleteCourse endpoint
			    res.write(" <a href=\"/deleteCourse?name=" + course.name + "\">[Delete Course]</a>");
			    res.write('</li>');
			// this creates a link to the /createClass endpoint
			    res.write(" <a href=\"/addClassView?name=" + course.name + "\">[Add Class]</a>");
			    res.write('</li>');
			});
			res.write('</ul>');
			res.end();
		    }
		}
	    }).sort({ 'department': 'asc' }); // this sorts them BEFORE rendering the results
});
//endpoint for all classes
app.use('/allClasses', (req, res) => {

	// find all the Person objects in the database
	Class.find( {}, (err, classes) => {
		if (err) {
		    res.type('html').status(200);
		    console.log('uh oh' + err);
		    res.write(err);
		}
		else {
		    if (classes.length == 0) {
			res.type('html').status(200);
			res.write('There are no classes to display');
			res.end();
			return;
		    }

		    else {
			res.type('html').status(200);
			res.write('Here are the classes in the database:');
			 

			res.write('<ul>');
			// show all the classes
			classes.forEach(  (c) => {
			    res.write('<li>');
			    res.write('Number: ' + c.courseNumber + '; Meeting days: ' + c.days + '; Required for Major: ' + c.majorRequirement + '; Number of Credits: ' + c.numCredits +'; Professor: ' + c.prof + '; Rating: ' + c.rating + '; Meeting Times: ' + c.time);
			    // this creates a link to the /delete endpoint
			    res.write(" <a href=\"/deleteClass?name=" + c.courseNumber + "\">[Delete]</a>");
			    res.write('</li>');
				 // creates a link to the /editClass endpoint
				res.write(" <a href=\"/editClass?name=" + c.courseNumber + "\">[Edit]</a>");
			    res.write('</li>');

			});
			res.write('</ul>');
			res.end();
		    }
		}
	    }).sort({ 'courseNumber': 'asc' }); // this sorts them BEFORE rendering the results
});

//endpoint for all courses and all classes
app.use('/showAll', (req, res) => {
//Finds all the courses, does error handling
	Course.find( {}, (err, courses) => {
		if (err) {
		    res.type('html').status(200);
		    console.log('uh oh' + err);
		    res.write(err);
		}
		else {
		    if (courses.length == 0) {
			res.type('html').status(200);
			res.write('There are no courses to display');
			res.write(" <a href=\"/public/courseform.html" + "\">[Add New Course]</a>");
			res.write('</li>'); 
			res.end();
			return;
		}
		   else {
			res.type('html').status(200);
			res.write('Here are the courses in the database:');
			res.write(" <a href=\"/public/courseform.html" + "\">[Add New Course]</a>");
			res.write('</li>');
			res.write('<ul>');
			// Writes out all courses in the database
				courses.forEach( (course) => {
				    res.write('<li>');
				    res.write('Name: ' + course.name + '; department: ' + course.department + '; level: ' + course.level + '; Domain: ' + course.domain);
				    res.write('; Required for major? ' + course.majorRequirement + '; description: ' + course.description);
				// this creates a link to the /updateCourseView endpoint, which brings the user to the related html page
				    res.write(" <a href=\"/updateCourseView?name=" + course.name + "\">[EditCourse]</a>");
				    res.write('</li>');
				    // this creates a link to the /deleteCourse endpoint, to be implemented
				    res.write(" <a href=\"/deleteCourse?name=" + course.name + "\">[Delete Course]</a>");
				    res.write('</li>');
				// this creates a link to the /addClassView endpoint, which brings the user to the related html page
				res.write(" <a href=\"/addClassView?name=" + course.name + "\">[Add Class]</a>");
				    res.write('</li>');
				res.write('</ul>');
				if (course.classList.length == 0){
					res.write('There are no classes to display');
				}
				else{ //Writes all the classes
						res.write('Here are the classes in the course:');
						res.write('<ul>');
						// show all the classes
						course.classList.forEach(  (c) => {
						    res.write('<li>');
						    res.write('Number: ' + c.courseNumber + '; Meeting days: ' + c.days + '; Meeting Times: ' + c.time + '; Professor: ' + c.prof);
						    // this creates a link to the /delete endpoint. Will want to add links to edit classes too.
						    res.write(" <a href=\"/deleteClass?name=" + c.courseNumber + "\">[Delete]</a>");
			 			   res.write('</li>');

                            res.write(" <a href=\"/updateClassView?name=" + c.CourseNumber + "\">[EditClass]</a>");
                            res.write('</li>');
						});
					}

				});
			}
			res.write('</ul>');
			res.end();
			}
		
		});
	});

app.use('/updateCourse', (req, res) => { //.../updateCourse?name=chem%20101&description=introChem
    var filter = {'name': req.query.name};
//Set to req.body.description instead of req.query.description since we'll be doing this through an html form.
    var newDescription = req.body.description;
    var action = {'$set': {description: newDescription}}
    Course.findOneAndUpdate( filter, action, (err,course) => {
        if (err) {
            console.log(err);
        }
        else if (!course){
            console.log("Course not found");
        }
        else{
            console.log("success")
        }
    });
    res.redirect('/all');
});

app.use('/updateCourseView',(req,res)=>{
	res.redirect('/public/updatecourseform.html?name=' + req.query.name);
//document.getElementById('courseName').innerHTML = req.query.name;
});
app.use('/updateClassView',(req,res)=>{
	res.redirect('/public/editclass.html?name=' + req.query.courseNumber);
//document.getElementById('courseName').innerHTML = req.query.name;
});

app.use('/addClassView',(req,res)=>{
console.log("Got to classView");
	res.redirect('/public/classform.html?name=' + req.query.name);
});


/*************************************************/
								//Class Endpoints // 

app.use('/updateClass', (req, res) => {
    var newDays = req.body.days;
    var newProf = req.body.prof;
    var newRating = req.body.rating;
    var newCredits = req.body.numCredits;
    var newTime = req.body.time;
    var filter = {'CourseNumber': req.query.courseNumber};
    var action = {'$set': {days: newDays, prof: newProf, rating: newRating, numCredits:newCredits, time: newTime}}
    Class.findOneAndUpdate( filter, action, (err,c) => {
        if (err) {
            console.log(err);
        }
        else if (!c){
            console.log("Class not found");
        }
        else{
            console.log("success")
        }
    });
    res.redirect('/allClasses');
});


//add classes directed from classform.html

//works for second course but not for first? 
app.use('/createClass', (req, res) => {
	//construct the Class from the form data which is in the request body
	var newClass = new Class ({
		courseNumber: req.body.courseNumber,
		days: req.body.days,
		prof: req.body.prof,
		semester: req.body.semester,
		time: req.body.time,
		courseID: req.body.courseID,
	});

	// // save the class to the database
	newClass.save( (err) => {
		if (err) {
			res.type('html').status(200);
			res.write('uh oh: ' + err);
			console.log(err);
			res.end();
		}
		else {
			// success message + update course classList to add the new class to db
			res.send('successfully added  course '  +newClass.courseNumber + ' to the database!');
			var filter = { 'name' : req.query.courseNumber };
			var action = { '$push' : { 'classList' : newClass}};
			Course.findOneAndUpdate(filter, action, {new: true}, (err, orig) => {
				if (err) {
					console.log('error!'); 
				}
				else if (!orig) {
					console.log('no classes!'); 
				}
				else {
					console.log('Updated class to course!'); 
				}
			});
		}
		});
	});


	//delete endpoint redirected from /showAll endpoint 
	app.use('/deleteClass', (req, res) => {
		var filter = { 'courseNumber' : req.query.courseNumber } 
		Class.findOneAndDelete( filter, (err, classes) => {
				if (err) {
					console.log(err);
				}
				else if (!classes){
					console.log("Class can't be deleted because it does not exist");
				}
				else{
					console.log("Successfully deleted!"); 
				}
			});
			res.redirect('/allClasses');
		});



app.use('/crossListClasses', (req, res) => { //crossListClasses?/courseID=34&courseID=244

	if(!req.query.courseID) {
		res.write('No classes to be crosslisted');
	}
	else {
	var { courseId1, courseId2 } = req.query.courseID; //store queries as array 

	// Find the Class objects with the given courseIds
	var class1 = Class.findOne({ courseID: courseId1 }).exec();
	var class2 = Class.findOne({ courseID: courseId2 }).exec();
  
	// If either of the classes does not exist, return an error
	if (!class1 || !class2) {
		res.send(err); 
	    res.write('One or both classes not found');
	}
  
	// crosslist the id query fields of the classes
	var crosslistedClass = {courseId: `${class1.courseId}-${class2.courseId}`};
  
	// return crosslisted fields 
	return res.json(crosslistedClass);
	}
  });
  


/*************************************************/

app.use('/public', express.static('public'));

app.use('/', (req, res) => { res.redirect('/showAll'); } );

app.listen(3000,  () => {

	console.log('Listening on port 3000');
    });
