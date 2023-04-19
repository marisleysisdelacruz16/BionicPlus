// set up Express
var express = require('express');
var app = express();
// set up BodyParser
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


// import the classes
var Course = require('./Courses.js');
var Class = require('./Classes.js');
var Account = require('./Account.js');
var Review = require('./Review.js');
var mongo = require('mongodb');
const { MongoClient } = require('mongodb');
const url = 'mongodb://127.0.0.1:27017/coursesDatabase';

//var mongoose = require('mongoose');
//var Schema = mongoose.Schema;

app.get('/courses', async(req, res) => {
	try{
		//connecting to MongoDB
		const client = MongoClient.connect(url,{ useNewUrlParser: true});
		//const data =  await db.collection('courseCollection').find().toArray();
		const data = await Course.find();
		
		res.json(data);
		//this.client.close();
		//this.client.close();

	}
	catch(error) {
		console.log(error);
		res.status(500).json({message: 'Internet server error'});
	}

	});

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
			res.redirect('/public/allCoursesPage.html');
		    //res.send('successfully added ' + newCourse.name + ' to the database');
			
		}
	    } );
		console.log(newCourse._id);
		//res.redirect('/public/allCoursesPage.html');
    }
    );

	app.use('/deleteCourse', (req, res) => {
		var filter = { 'name' : req.query.name };
		Course.findOneAndDelete(filter, (err, deletedCourse) => {
			if (err) {
			   res.type('html').status(200);
				console.log('uh oh -- error deleting course' + err);
				res.write(err);
			}
			else if (!deletedCourse){
				  res.type('html').status(200);
				res.write('Course ' + deletedCourse.name + ' does not exist!');
				res.end();
				return;
			}
			else{
				//Deletes all classes under the course
				deletedCourse.classList.forEach( (classToDelete) => {
					var filter = { 'courseNumber' : classToDelete.courseNumber }
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
				});




				res.send('successfully removed ' + deletedCourse.name + ' from the database  \n' + " <a href=\"/showAll\">[Return to View All]</a>");

			}
		});
	});

	app.use('/deleteCourseWarning', (req, res) => {
		res.type('html').status(200);
		res.write('Are you sure you want to delete the course ' + req.query.name +'?');
						res.write('</li>');
		res.write(" <a href=\"/deleteCourse?name=" + req.query.name + "\">[Yes]</a>");
						res.write('</li>');
		res.write(" <a href=\"/showAll\">[No, go back]</a>");
		res.end();
		});


	app.use('/test',async(req,res)=>{
		var inputClass = [];
			Class.find( {}, (err, classes) => {
				if (err) {
					res.json({"status" : "err"});
				}
				else{
					classes.forEach((c) =>{
						inputClass.push(c);
					});
				}
				res.json({"status" : inputClass})
			});
			
		
	})

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
app.use('/coursesjson', (req, res) => {

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
			// show all the courses
			var data = [];
			courses.forEach( (course) => {
			    data.push({Name: course.name, department: course.department , level: course.level, domain: course.domain})

		    });
		    res.json(data);
		   }
    } // this sorts them BEFORE rendering the results
});
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
				//
			    res.write('Number: ' + c.courseNumber + '; Meeting days: ' + c.days + '; Required for Major: ' + c.majorRequirement + '; Number of Credits: ' + c.numCredits +'; Professor: ' + c.prof + '; Rating: ' + c.rating + '; Meeting Times: ' + c.time);
			    // this creates a link to the /delete endpoint
			    res.write(" <a href=\"/deleteClass?name=" + c.courseNumber + "\">[Delete]</a>");
			    res.write('</li>');
				//pass course name and id
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

app.use('/clearAll',(req,res)=>{

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
				
				if (course.classList.length == 0){
					res.write('There are no classes to display');
				}
				else{ //Writes all the classes
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
				    res.write('</li>');
				res.write('</ul>');

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

app.use('/getSchedule', (req, res) => { 
	//Finds the related account
    var filter = {'username' : req.query.username};
	var scheduleFilter = {'_id' : req.query.scheduleID}

			Account.findOne(filter, (err,acc) =>{
				if (err){
					res.json({'status' : err})
				}
				else if (!acc){// If the account isnt there, something's wrong
					res.json({'status' : 'Illegal State!'})
				}
				else{
					acc.schedule.findOne(scheduleFilter, (err,sched) =>{
						if (err){
							res.json({'status' : err})
						}
						else if (!acc){// If the schedule isn't there,not there.
							res.json({'status' : 'Schedule not found!'})
						}
						else{res.json({'status' : 'Success','Schedule' : acc.schedule})
					}
					});
					
				}

			});
    
});

app.use('allSchedules',(req, res) => { 
	//Finds the related account
    var filter = {'username' : req.query.username};

			Account.findOne(filter, (err,acc) =>{
				if (err){
					res.json({'status' : err})
				}
				else if (!acc){// If the account isnt there, something's wrong
					res.json({'status' : 'Illegal State!'})
				}
				else{
					res.json({'status' : 'Success','Schedule' : acc.schedule})
				}

			});
    
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
		courseID: req.body.ID,
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
			res.send('successfully added  course '  + newClass.courseNumber + ' to the database!');
			var filter = { 'name' : req.query.name };
			var action = { $push : { 'classList' : newClass}};


	
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
		//get class somehow to call on its id
		var filter = { 'ID' : _id }
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
			if (req.query.courseName){
				var filter2 = {'name' : req.query.courseName}
				var action = {$unset : {"classList.$._id" : _id}}
			Class.updateOne(filter2, action, (err,course)=>{
				if (err) {
					console.log(err);
				}
			});
			}
			res.redirect('/allClasses');
		
			
		});
		

		app.post('/createReview', async (req,res)=> {
			var newReview = new Review ({
				title: req.body.title,
				author: req.body.author,
				// how would I do date?
				content: req.body.content,
				rating: req.body.rating,
				commentsThread : []
			});

			// save the review to the database
			newReview.save( (err) => {
				if (err) {
					res.type('html').status(200);
					res.write('uh oh: ' + err);
					console.log(err);
					res.end();
				}
				else {
					var action = { '$push' : { 'commentsThread' : newReview}};
					Review.updateOne(action, {new: true}, (err) => {
						if (err) {
							console.log('error!');
						}
						else {
							console.log('Added a review to the class!');
						}
					});
				}
				});
			});


		//Makew a new account; if the username is taken / it already exists, doesnt do so.
		//Fields are username and password. ScheduleList to be filled later.
		app.use('/createAccount', (req, res) => {
			//Where the method starts
			var newAccount = new Account ({
				username: req.query.username,
				password: req.query.password,
				schedule: []
			});
		
			//Checks if there's one that exists already
			var filter = {'username' : req.query.username};

			Account.findOne(filter, (err,account) =>{
				if (err){
					res.json({'status' : err})
				}
				else if (!account){// If the account isnt there, saves it
					newAccount.save( (err) => {
						if (err) {
							res.json({'status' : err})
						}
						else {
							// display the "successfull created" message,sends new account
							res.json({'status' : 'Account ' + newAccount.username + ' added to to the database',
									'newAccount' : newAccount});
						}
						} );
				}
				else{
					res.json({'status' : 'Username taken!'})
				}

			});
		
		});
		//Makes a new blank schedule.
		app.use('/createSchedule',(req,res)=>{
			var filterAcc = {'username' : req.query.username};
			var newSchedule = new Schedule ({
				scheduleName: req.query.scheduleName,
				classList : []
			});

			const update = {
				$push: { schedule: newSchedule }
			  };
			
			Account.updateOne(filterAcc, update, (err,account) => {
				if (err){
					res.json({'status' : err})
				}
				else if (!account){// Account should be there
					res.json({'status' : 'Illegal state!'})
				
				}
				else{
					res.json({'status':'Created new schedule!', 'account' : newSchedule.scheduleName})
				}
			});
		});
		//Needs courseNumber to find the class in question, as well as the _id of the schedule
		  app.use('/addClassToSchedule', (req,res)=>{
			
			var filterClass= {'courseNumber' : req.query.courseNumber};
			//Finds the class
			Class.findOne(filterClass, (err,c)=>{
				if(err){
					res.json({'status':err})
				}
				else if (!c){
					res.json({'status':"Class doesn't exist!"})
				}
				else{
					
					var filterAcc = {'username' : req.query.username};

					const update = {
						$push: { "schedule.$._id": req.query.scheduleID }
					  };
				  
				
		
					//Finds the account to get the existing list, then finds it again to update
					Account.updateOne(filterAcc, update, (err,account) => {
						if (err){
							res.json({'status' : err})
						}
						else if (!account){// Account should be there
							res.json({'status' : 'Illegal state!'})
						
						}
						else{
							res.json({'status':'Added class!', 'account' : c})
						}
					});
					}
				});
		  });

		 /* app.use('/clearSchedule', (req,res)=>{
			
			
			
					var filterAcc = {'username' : req.query.username};

					const update = {
						$set: { schedule: [] }
					  };
				  
				
		
					//Finds the account to get the existing list, then finds it again to update
					Account.updateOne(filterAcc, update, (err,account) => {
						if (err){
							res.json({'status' : err})
						}
						else if (!account){// Account should be there
							res.json({'status' : 'Illegal state!'})
						
						}
						else{
							res.json({'status':'Cleared schedule!'})
						}
					});
				});*/
		

		//Attempts to log in to an account. If it doesn't exist, says so; if the password is wrong, likewise.
		//Fields are username and password. ScheduleList to be filled later.
		app.use('/loginAccount', (req, res) => {

			//Checks if there's one that exists already
			var filter = {'username' : req.query.username};

			Account.findOne(filter, (err,account) =>{
				if (err){
					res.json({'status' : err})
				}
				else if (!account){// If the account isnt there, says so
					res.json({'status' : "Account doesn't exist!"})
				}
				else if (account && account.password != req.query.password){//If the account is there but the password is wrong, returns an error
					res.json({'status' : "Incorrect password!"})
				}
				else{//Otherwise, returns the account object.
					res.json({'status' : 'Login successful!',
							'account' : account});
				}

			}
		)

				console.log(Account._id);
		  });

		  //Displays all accounts; for debugging purposes.
		  app.use('/allAccounts',(req,res)=>{
			Account.find( {}, (err, accounts) => {
				if (err) {
					res.type('html').status(200);
					console.log('uh oh' + err);
					res.write(err);
				}
				else {
					if (accounts.length == 0) {
					res.type('html').status(200);
					res.write('There are no accounts');
					res.end();
					return;
					}

					else {
					res.type('html').status(200);
					res.write('Here are the accounts in the database:');


					res.write('<ul>');
					// show all the classes
					accounts.forEach(  (acc) => {
						res.write('<li>');
						res.write('Username: ' + acc.username + '; Password: ' + acc.password + '; Schedule: ' + acc.schedule);
					});
					res.write('</ul>');
					res.end();
					}
				}
				}).sort({ 'courseNumber': 'asc' }); // this sorts them BEFORE rendering the results
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

app.use('/',(req,res) => {
	res.redirect('/public/homepage.html');});
//app.use('/', (req, res) => { res.redirect('/showAll'); } );

app.listen(3000,  () => {

	console.log('Listening on port 3000');
    });
