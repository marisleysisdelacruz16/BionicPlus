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
var Schedule = require('./Schedule.js')
var mongo = require('mongodb');
var mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const url = 'mongodb://127.0.0.1:27017/coursesDatabase';

const { db } = require('./Classes.js');
const { deprecate } = require('util');
const { ObjectId } = require('mongodb');
const { equal } = require('assert');
//var mongoose = require('mongoose');
//var Schema = mongoose.Schema;

// app.get('/coursesJSON', async(req, res) => {
// 	try{
// 		//connecting to MongoDB
// 		const client = MongoClient.connect(url,{ useNewUrlParser: true});

// 		// client.connect((err) => {
// 		// 	if (err) {
// 		// 	  console.error(err);
// 		// 	  return;
// 		// 	}
		  
// 		// 	const db = client.db('coursesDatabase');
		  
// 		// 	db.collection('reviews').dropIndex('author_1', (err, result) => {
// 		// 	  if (err) {
// 		// 		console.error(err); 
// 		// 		return;
// 		// 	  }
		  
// 		// 	  console.log(result);
// 		// 	  client.close();
// 		// 	});
// 		//   });




// 		//const data =  await db.collection('courseCollection').find().toArray();
// 		const data = await Course.find();
		
// 		res.json(data);
// 		//this.client.close();
// 		//this.client.close();

// 	}
// 	catch(error) {
// 		console.log(error);
// 		res.status(500).json({message: 'Internet server error'});
// 	}

// 	});

app.use('/createCourse', (req, res) => {
	// construct the Course from the form data which is in the request body
	var newCourse = new Course ({
		name: req.body.name,
		department: req.body.department,
		level: req.body.level,
		description: req.body.description,
		domain: req.body.domain,
		majorRequirement: req.body.majorRequirement,
		crossList: req.body.crosslist, 
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

	app.get("/course/:id", async (req,res) => {
		//var courseId = req.query.courseId;
		//const courseId = req.params.id;
	
			//connecting to MongoDB
			const client = await MongoClient.connect(url,{ useNewUrlParser: true});
			const selectedCourse = await Course.findOne({_id:req.params.id});
			//const selectedCourse = await Course.findById(new ObjectId(courseId));
			res.json({selectedCourse});
			
			//res.json(selectedCourse);
		}
		// catch (error) {
		// 	console.log(error);
		// 	res.status(500).send("Error fetching course data");
		// }

	)

	app.use('/deleteCourse', (req, res) => {
		var filter = {'id': req.query.id}; 
		//console.log("course to be deleted: " + JSON.stringify(filter)); 
		// var filter = {_id : "6444026e1c184057106fcf41"}; 
		Course.findOneAndDelete(filter, (err, deletedCourse) => {
			if (err) {
			   res.type('html').status(200);
				console.log('uh oh -- error deleting course' + err);
				res.write(err);
			}
			else if (!deletedCourse){
				  res.type('html').status(200);
				console.log("could not find course")
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
				//res.send('successfully removed ' + deletedCourse.name + ' from the database  \n' + " <a href=\"/showAll\">[Return to View All]</a>");
			}
			res.redirect('/public/allCoursesPage.html');
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
			    res.write(" <a href=\"/deleteCourse?name=" + course.name + "&id=" + course._id + "\">[Delete Course]</a>");
			    //console.log(course._id);
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

	// find all the objects in the database
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
			    data.push({Name: course.name, Id: course._id, department: course.department , level: course.level, domain: course.domain})

		    });
		    res.json(data);
		   }
    } // this sorts them BEFORE rendering the results
});
});
//endpoint for all classes
app.use('/classesjson', (req, res) => {

	// find all the objects in the database
	Class.find( {}, (err, classes) => {
		if (err) {
		    res.type('html').status(200);
		    console.log('uh oh' + err);
		    res.write(err);
		}
		else {
		    if (classes.length == 0) {
			res.type('html').status(200);
			res.write('There are no courses to display');
			res.end();
			return;
		    }
		    else {
			// show all the classes
			var data = [];
			classes.forEach( (c) => {
			    data.push({courseNumber: c.courseNumber, days: c.days , prof: c.prof, time: c.time, semester:c.semester, courseId: c.courseId, crossListId: c.crossListId})

		    });
		    res.json(data);
		   }
    } // this sorts them BEFORE rendering the results
});
});
app.use('/search', (req, res) => {
    res.redirect('/public/search.html');
    var filter = {'courseNumber': req.body.courseNumber};
    console.log(filter);
    Class.findOne( filter, (err,c) => {
        if (err) {
            console.log(err);
        }
        else if (!c){
            res.write("Class not available");

            console.log("Class not found");
        }
        else{
            console.log("success");
            res.write('Here is the class: \n courseNumber: ' + c.courseNumber + '\n days: '+ c.days + '\n prof: '+ c.prof + '\n semester: '+ c.semester + '\n time: ' + c.time + '\n courseId: ' + c.courseId + '\n crossListId: ' + c.crossListId );
            res.end();
        }
    });
});

app.use('/allClasses', (req, res) => { //broken
	Course.find( {}, (err, courses) => {
		if (err) {
		    res.type('html').status(200);
		    console.log('uh oh' + err);
			res.write(err);
		}
		else if (courses.length == 0) {
			res.write('There are no courses in the database'); 
		}
		else {
			courses.forEach(  (course) => {
				//console.log("inside " + course);
			if (err) {
				console.log('uh oh' + err);
			}
			else if (course.classList.length == 0){
				res.write('<p>There are no classes to display</p>');
			}
			else{ 
			res.write('<h2>Here are the classes in the database:</h2>');
			res.write('<ul>');
			course.classList.forEach(  (c) => {
			    res.write('<li>');
			    res.write('Number: ' + c.courseNumber + '; Meeting days: ' + c.days + '; Required for Major: ' + course.majorRequirement + '; Number of Credits: ' + course.numCredits +'; Professor: ' + c.prof + '; Rating: ' + course.rating + '; Meeting Times: ' + c.time + '	CrossListed with: ' + c.crossListId);
			    // this creates a link to the /delete endpoint
			    res.write(' <a href=\"/deleteClass?name=' + c.courseNumber + '&id=' + c._id + '\">[Delete]</a>');
			    res.write('</li>');
				res.write(' <a href=\"/updateClassForm?name=' + course.name + '&id=' + c._id + '\">[Edit]</a>');
			    res.write('</li>');
			});
			//res.write('</li>');
			res.write('</ul>');
		    }
		});
		}
	    }).sort({ 'courseNumber': 'asc' }); // this sorts them BEFORE rendering the results
});




//endpoint for all courses and all classes

app.use('/showAll', (req, res) => {
//Finds all the courses, does error handling
	Course.find( {}, (err, courses) => {
		//console.log(courses)
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
				    res.write('; Required for major? ' + course.majorRequirement + '; description: ' + course.description + '; CrossListed with: ' + course.crossList);
				// this creates a link to the /updateCourseView endpoint, which brings the user to the related html page
				    res.write(" <a href=\"/updateCourseView?name=" + course.name + "\">[EditCourse]</a>");
				    res.write('</li>');
				    // this creates a link to the /deleteCourse endpoint, to be implemented
				    res.write(" <a href=\"/deleteCourse?id=" + course._id + "\">[Delete Course]</a>");
					console.log("found course: " + course._id);
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
						    res.write('Number: ' + c.courseNumber + '; Meeting days: ' + c.days + '; Meeting Times: ' + c.time + '; Professor: ' + c.prof + '; Semester: ' + c.semester);
						    // this creates a link to the /delete endpoint. Will want to add links to edit classes too.
						    res.write(" <a href=\"/deleteClass?name=" + course.name + "&id=" + c._id +  "\">[Delete]</a>");
			 			   res.write('</li>');

                            res.write(" <a href=\"/updateClassForm?name=" + course.name + "&id=" + c._id +  "\">[EditClass]</a>");										
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
   // var filter = {'id': req.query.id};
    var filter = {'name': req.query.name};
	console.log("updating " + JSON.stringify(filter));
//Set to req.body.description instead of req.query.description since we'll be doing this through an html form.
	//var newName = req.body.name; 
	var newDept = req.body.department;
	var newLevel = req.body.level;
	var newDomain = req.body.domain; 
    var newDescription = req.body.description;
    var newCross = req.body.crosslistText;  

	// Find the course that we want to update 
		Course.findOne(filter, (err, findCourse) => {
		  //console.log(findCourse);
		  if (err) {
			console.log(err);
		  } else if (!findCourse) {
			console.log("Course does not exist");
		  } else {
			console.log("found " + findCourse + " !");

		if (newDept) {
			findCourse.department = newDept; 
		}
		if (newLevel) {
			findCourse.level = newLevel;
		}		
		if (newDomain) {
			findCourse.domain = newDomain; 
		}
		if (newDescription) {
			findCourse.description = newDescription;
		}
		if (newCross) {
			findCourse.crossList= newCross;
		}
			  
	var action = {department: newDept, level: newLevel, domain: newDomain, description: newDescription, crossList: newCross};
				Course.findOneAndUpdate(filter, action, (err, updatedCourse) => {
        if (err) {
            console.log(err);
        }
				  else if (!updatedCourse) {
					console.log("Course couldn't be updated");
        }
				  else { 
				  console.log("Successfully updated" + updatedCourse + "class!" ); 
        }
    });
			}
		//res.redirect("/showAll"); 
		res.redirect('/public/allCoursesPage.html');
		//res.redirect('/public/updateclassform.html?name=' + req.query.name + "&id=" + req.query.id);
	});
});

app.use('/getAllSchedules',(req,res)=>{
//Finds the related account
var filter = {'username' : req.query.username};
Account.findOne(filter, (err,acc) =>{
	//error
	if (err){
		res.json({'status' : err})
	}
	else if (!acc){// If the account isnt there, something's wrong
		res.json({'status' : 'Illegal State!'})
	}//returns the full list
	else{
		res.json({'status' : 'Success', 'scheduleList' : acc.schedule})
	}
});

});

app.use('/getSchedule', (req, res) => { 
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
					//Flag to see if the schedule was found
					var found = false;
					for (let i = 0 ; i < acc.schedule.length; i++){//Will do nothing if it is found.
						//res.write("ScheduleName");
						if (!found && acc.schedule[i]["_id"] == req.query.scheduleID)
							{
								res.json({"status" : "success", "schedule" : acc.schedule[i]});
								found = true;
							}
					}//If we didn't find it, we send a failure.
					if (!found){
						res.json({"status" : 'No schedule found!'})
					}
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

app.use('/updateClassForm',(req,res)=>{
	res.redirect('/public/updateclassform.html?name=' + req.query.name + "&id=" + req.query.id);
}); 


/*************************************************/
								//Class Endpoints //

app.use('/updateClass', (req, res) => {
    var newDays = req.body.days;
    var newProf = req.body.prof;
    var newRating = req.body.rating;
    var newCredits = req.body.numCredits;
    var newTime = req.body.time;
    var newSemester = req.body.semester;
    

  // Find the course that class belongs to
  var filter = { name: req.query.name };
  Course.findOne(filter, (err, findCourse) => {
    console.log(findCourse);
    if (err) {
      console.log(err);
    } else if (!findCourse) {
      console.log("Class can't be updated bc the Course does not exist");
    } else {
      console.log("found " + findCourse + " !");

	var classId = req.query.id;
	var classToUpdate = findCourse.classList.find((c) => c._id.toString() === classId);
	//console.log(JSON.stringify(classToUpdate))
		if (err) {
			console.log('error!');
		}
		else if (!classToUpdate) {
			console.log('Class not found');
		}
		else {
		//if (classToUpdate._id == classId) { 
			//if contents are changed, then update it otherwise keep it the same
			if (newDays) {
				classToUpdate.days = newDays;
			  }
			  if (newProf) {
				classToUpdate.prof = newProf;
			  }
			  if (newTime) {
				classToUpdate.time = newTime;
			  }
			  if (newSemester) {
				classToUpdate.semester = newSemester; 
			  }
			 
		
	 	var action = { '$set' : { classList : findCourse.classList } };
			Course.findOneAndUpdate(filter, action, (err, updatedCourse) => {
        if (err) {
            console.log(err);
        }
			else if (!updatedCourse) {
				console.log("Course couldn't be updated");
        }
        else{
			console.log("Successfully updated" + updatedCourse + "class!" ); 
        }
    });
		}
	}
	res.redirect("/showAll"); 
	});		
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
		courseId: req.body.courseId,
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
			res.send('successfully added  class '  + newClass.courseNumber + ' to the database!');
			var filter = { 'name' : req.query.name };
			console.log(filter);
			var action = { $push : { 'classList' : newClass}};

			//{new: true},
			Course.findOneAndUpdate(filter, action, (err, orig) => {
				if (err) {
					console.log('error!');
				}
				// else if (!orig) {
				// 	console.log('no classes!');
				// }
				else {
					console.log('Updated class to course!');
				}
			});
		}
		});
	});


	//delete endpoint redirected from /showAll endpoint
	app.use('/deleteClass', (req, res) => {
		var filter = { 'name' : req.query.name };
		Course.findOne( filter, (err, findCourse) => { 
			console.log(findCourse);
				if (err) {
					console.log(err);
				}
			else if (!findCourse) {
				console.log("Class can't be deleted bc the Course does not exist");
				}
				else{
				console.log("found " + findCourse + " !");
				//iterate over classList to find class to delete by comparing ids
					findCourse.classList.forEach( (findClass ) => {
						console.log(findClass)
						if (err) {
							console.log('error!');
				}
						else if (!findClass) {
							console.log('class does not exist!');
						}
						else {
							let classIndex = -1; 
							let classId = req.query.id; 
							findCourse.classList.forEach((classToDelete, i) => { //forEach(element, index)
								if (classToDelete._id.toString() === classId) {
									classIndex = i; 
								}
							})
							findCourse.classList.splice(classIndex, 1); //remove class from that index
							var action = {'$set': {classList : findCourse.classList}}; //update class list
							  Course.findOneAndUpdate(filter, action, (err, updatedCourse) => {
				if (err) {
					console.log(err);
				}
								else if (!updatedCourse) {
									console.log("Course couldn't be updated");
								}
								else{ 
									console.log("Successfully deleted class!" ); 
								}
			});
			}
					});
				res.redirect('/showAll');
			}
		
			
		});
	});
		

	// app.use('/crossListClasses', (req, res) => { //crossListClasses?/courseID=34&courseID=244
		
	// 	var class2 = req.query.crosslistText; //get text to identify crosslisted course number
	// 	//find the class we're in and update its field
	// 	var filter = {'name': req.query.name}; 
	// 	var action = {'$set': {crossListId: `${Class.courseNumber}-${class2}`}}
	// 		Class.findOneAndUpdate( filter, action, (err,c) => {
	// 			if (err) {
	// 				console.log(err);
	// 			}
	// 			else if (!c){
	// 				console.log("Class not found");
	// 			}
	// 			else{
	// 				console.log("success")
	// 			}
	// 		});
	// });

		app.use('/createReview', (req,res)=> {
			// var filter = { 'name' : req.query.name };
			// console.log("name= " + JSON.stringify(filter)); 
			//console.log("title = " + req.query.title)
			//Review.findById(review.author)

			// Review.collection.dropIndex('author_1', (err, result) => {
			// 	if (err) {
			// 	  console.error(err);
			// 	  return;
			// 	}
			  
			// 	console.log("successfully removed!");
			//   });

			var newReview = new Review ({
				title: req.query.title,
				content: req.query.content,
				rating: req.query.rating,
				commentsThread : []
			});
			console.log(JSON.stringify("title = " + newReview.title))
			console.log(JSON.stringify("content = " + newReview.content))
			console.log(JSON.stringify("rating = " + newReview.rating))
			console.log(JSON.stringify("review = " + newReview)); 

			// save the review to the database
			newReview.save( (err) => {
				if (err) {
					console.log(err);
					res.json({'status' : "error saving " + err }) //REACHING THIS ERROR
				}
				else {
					var filter = ({'id=' : newReview._id})
					console.log("id=" + newReview._id);
					var action = { '$push' : { 'commentsThread' : newReview}};
					Review.findOneAndUpdate(filter, action, (err) => {
						if (err) {
							res.json({'status' : "error updating " + err})
							console.log("error= " + err)
						}
						else {
							res.json({'status' : "success! added a review to course"})
							console.log('Added a review to the class!');
						}
				});
			}
		});
	});


		app.get('/allReviews', (req, res) => {
			//find all the reviews of given course from spinner
			Review.find({}, (err, reviews) => {
				if (err) {
					res.json({'status' : err})
				}
				else if (reviews.length == 0) {
					res.json({'status' : "No Reviews exist in DB"})
				}
				else { 
					//display all reviews
					//unsure what commentThread is doing unless it stores new reviews in 
					//an array () but also as an ind obj ) and must iterate over
					//res.write('<ul>');
					var jsonArrray = [];
					reviews.forEach( (review) => {
						//res.write('<li>');
						//res.write('Title: ' + review.title + '; Content: ' + review.content + '; Rating: ' + review.rating);
						var jsonObject = {'Title': review.title, 'Content':review.content, 'Rating':review.rating};
						jsonArrray.push(jsonObject);
						//res.json( {'status' : 'success!', 'reviews' : review})
					});
					res.json({'status':jsonArrray});
					//res.write('</ul>');
					res.end();
				}
				///res.end();

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
			//Saves it so we have the ID somewhere
			newSchedule.save( (err) => {
				if (err) {
					res.json({'status':err})
				}
				else {
					//Then pushes it where it goes
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
							res.json({'status':'Created new schedule!', 'schedule' : newSchedule.scheduleName, 'id' : newSchedule._id})
						}
					});
				}
				} );
				
			
		});
		//Needs courseNumber to find the class in question, as well as the _id of the schedule
		  app.use('/addClassToSchedule', (req,res)=>{
			
			var filterClass= {'courseNumber' : req.query.courseNumber};
			//Finds the class
			Class.findOne(filterClass, (err,c)=>{
				if(err){
					res.json({'status':err,'err#':1})
				}
				else if (!c){
					res.json({'status':"Class doesn't exist!"})
				}
				else{
					Account.updateMany({ "username" : req.query.username},
					{ $push: { "schedule.$[item].classList": c }},
					{"arrayFilters" : [ {
						"item._id" : mongoose.Types.ObjectId(req.query.scheduleID)}]},
						(err,sched)=>{
						if (err){
							res.json({'status' : err})
						}
						else if (!sched){// Account should be there
							res.json({'status' : 'Illegal state!'})
						
						}
						else{
							res.json({'status':'Added class!', 'account' : sched})
						}});
					
				  }
				});
			});
				

		  app.use('/deleteSchedule',(req,res)=>{
			//Finds the related account
			var filter = {'username' : req.query.username};
			var update = {$pull:{
				schedule: {_id : mongoose.Types.ObjectId(req.query.scheduleID) }
			}}
			Account.findOneAndUpdate(filter, update, (err,acc) =>{
				if (err){
					res.json({'status' : err})
				}
				else if (!acc){// If the account isnt there, something's wrong
					res.json({'status' : 'Illegal State!'})
				}
				else{
						res.json({'status' : 'success', 'result' : acc})
					

			}
			});
 
});


		  app.use('/clearSchedule', (req,res)=>{
			
			
			
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
				});
		

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
