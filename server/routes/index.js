/*--------Route key (for later)---------------
Use Ctrl + F to find and replace these;
/login                == /login.html
/create               == /create.html
/schedule             == /schedule.html
/schedule/payment     ==
/schedule/confirm     ==
/logout               == /logout
/StudentUpdate        ==
--------------------------------------------*/

const express = require('express');
const passport = require('passport');
//const apicache = require('apicache');
const StudentModel = require('../models/StudentModel');
const TutorModel = require('../models/TutorModel');
const path = require('path');

const router = express.Router();

//doesnt this need to be in module.exports? it doesnt matter, bec module.exports only returns the router
function redirectIfLoggedIn (req, res, next) {
  console.log(req.user)
  if (req.user) { //was if (req.user)
    console.log('redirecting, as the user is already logged in');
    return res.redirect('/schedule');
  }
  return next(); //this is only really useful if the if statement doesnt execute
}

function redirectIfNotLoggedIn (req, res, next) {
  if (!req.user) {
    return res.redirect('/login');
  }
  return next();
}

const root = __dirname + '../../../public/html/';

module.exports = () => {

  //-----------------Defining all URL routes and sending html files--------------------------
  //The res.redirects here are not working for some reason. It may not even be an issue, i'm not sure
  router.get('/', (req, res) => {
    res.sendFile(path.join(root, 'index.html'));
  });

  router.get('/html/', (req, res) => {
    return res.redirect('/');
  });

  router.get('/pricing', (req, res) => {
    res.sendFile(path.join(root, 'pricing.html'));
  });

  router.get('/html/pricing.html', (req, res) => {
    return res.redirect('/pricing');
  });

  router.get('/login', redirectIfLoggedIn, (req, res) => {
    res.sendFile(path.join(root, 'login.html'));
  });

  router.get('/html/login.html', (req, res) => {
    return res.redirect('/login');
  });

  router.get('/create', (req, res) => {
    res.sendFile(path.join(root, 'create.html'));
  });

  router.get('/html/create.html', (req, res) => {
    return res.redirect('/create');
  });

  router.get('/schedule', redirectIfNotLoggedIn, (req, res) => {
    res.sendFile(path.join(root, 'schedule.html'));
  });

  router.get('/html/schedule.html', (req, res) => {
    return res.redirect('/schedule');
  });

  router.get('/contact', (req, res) => {
    res.sendFile(path.join(root, 'contact.html'));
  });

  router.get('/html/contact.html', (req, res) => {
    return res.redirect('/contact');
  });

  router.get('/careers', (req, res) => {
    res.sendFile(path.join(root, 'careers.html'));
  });

  router.get('/html/careers.html', (req, res) => {
    return res.redirect('/careers');
  });

  router.get('/logout', (req, res) => {
    req.logout();
    return res.redirect('/');
  });

  //-----------------------------------------------------------------------------------------
  
  router.post('/login', passport.authenticate('local', {
    successRedirect: '/schedule',
    failureRedirect: '/login?error=true',
  }));

  router.post('/create', async (req, res, next) => {
    try {
      const user = new StudentModel({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber
      });

      const savedUser = await user.save();

      if (savedUser) return res.redirect('/login'); //determine if creating an account serializes a session, if so send them straight to schedule
      return next(new Error('Failed to save user for unknown reasons'));
    } catch (err) {
      console.log(err.code); //log.error (later problem)
      return next(err);
      //return res.send('Error: 11000: Cannot save a duplicate user')
    }
  }); 

  router.post('/schedule', async (req, res, next) => {
    const { course, location, time } = req.body;

    console.log(course);

    req.session.course = course;
    req.session.location =  location;
    req.session.time = time;

    const tutors = await TutorModel.find({courses: course, currentlyWorking: false}).sort({ averageRating: -1});
    console.log(tutors);
    res.json(tutors);

    /*
    TutorModel.findOne({ courses: req.body.course }, (tutors) => {
      req.session.course = course;
      req.session.location =  location;
      req.session.time = time;
      console.log(tutors);
      res.json(tutors);
    }).toArray//.sort({ averageRating: -1}).toArray();
    */
  });
  
  router.post('/TutorSelect', async (req, res) => {
    console.log(req.body.tutor);

    await TutorModel.findByIdAndUpdate(req.body.tutor, { currentlyWorking: true }, (tutor) => {
      req.session.tutor = tutor;
    });

    res.redirect('/schedule/payment')
    /* //Worry about updating the tutors later. For now, just add the tutor email to the req.session.tutor
    TutorModel.findByIdAndUpdate({ id: req.body._id }, { currentlyWorking: true }, (tutor) => {
      console.log(req.body);
      console.log(req.body._id)
      if (tutor) {
        console.log(tutor);
        req.session.tutor = req.body._id;
        return res.redirect('/Schedule/Payment'); //do payment and confirmation on the same page
      }
      //handle error
    });*/
  });

  router.post('/TutorCreate', async (req, res, next) => {
    try {
      const user = new TutorModel({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        //averageRating: null,
        courses: req.body.courses,
        //timesAvail: req.body.timesAvail,
        //currentlyWorking: false,
        //avatar: req.body.avatar,
      });

      const savedUser = await user.save();

      if (savedUser) return res.send(savedUser); //this aint right
      return next(new Error('Failed to save user for unknown reasons'));
    } catch (err) {
      console.log(err.code); //log.error (later problem)
      return next(err);
      //return res.send('Error: 11000: Cannot save a duplicate user')
    }
  });

  return router;
};

  //This works, however I need to determine how to deal with errors without crashing the server
  //and letting the user know what went wrong in a professional way (ex we dont want a 404 page or something like that)
  //I want to be able to tell them on the page that the stuff is wrong (this is where socket.io comes in, especially if
  //I am using actual forms to send the data rather than JQuery)


/*---------------STUFF THAT DOESNT WORK AND NEEDS TO BE ADDRESSED LATER--------------------------------------------------
//This route does not work, but it needs to be an async function in order to make everything work
  router.post('/StudentUpdate', async (req, res, next) => { //I am not sure if this should be a POST on a new route, a PUT on a current route, or a PATCH
    try {
      //const currentPass = req.currentPass, newPass = req.newPass;
      const updatedUser = await StudentModel.updateOne({ email: req.body.email }, { password: req.body.newPassword });
      console.log(res.n, res.nModified)
      if (updatedUser) return res.redirect('/Schedule') //this definitely will not stay, this does not serve the purpose of logging in
      //THE REASON THAT THIS CANNOT STAND AS LOGGING IN IS BECAUSE THE USER MUST GO THROUGH PASSPORT TO LOGIN, OTHERWISE EVERYTHING IS FUCKED UP
      return next(new Error('Failed to update user for unknown reasons'))
    } catch (err) {
      return next(err);
    }
  });

  //This route does not work, but it needs to be an async function in order to make everything work
  router.post('/TutorUpdate', async (req, res, next) => { //I am not sure if this should be a POST on a new route, a PUT on a current route, or a PATCH
    try {
      //const currentPass = req.currentPass, newPass = req.newPass;
      const updatedUser = await TutorModel.updateOne({ email: req.body.email }, { password: req.body.newPassword });
      console.log(res.n, res.nModified)
      if (updatedUser) return res.redirect('/Schedule') //this definitely will not stay, this does not serve the purpose of logging in
      //THE REASON THAT THIS CANNOT STAND AS LOGGING IN IS BECAUSE THE USER MUST GO THROUGH PASSPORT TO LOGIN, OTHERWISE EVERYTHING IS FUCKED UP
      return next(new Error('Failed to update user for unknown reasons'))
    } catch (err) {
      return next(err);
    }
  });

  //figure out a good way to do this:
  //  i can either do two separate pages and requests, or I can use socket.io in order to have one request on this page
  //  which would be more difficult?
  //how can I have client pages react to the responses from these http requests in a script?
  //FOR NOW, JUST DO SEPARATE PAGES: ITS THE MOST SIMPLE, AND IF SPEED BECOMES AN ISSUE, I CAN CHANGE IT BACK
  // actually, no matter what, I am going to need some clientside script to append the tutors to the page
  //BUT, THERE is a javascript way to deal with appending elements and all that crap
  router.post('/Schedule', (req, res) => {
    req.session.tutor = req.body.tutor; //this should end up being the entire tutor object, as the entire tutor object should be sent to the client and selected by the student
    req.session.course = req.body.course;
    req.session.time = req.body.time;
  });

  //router.get('/TutorLogin', redirectIfLoggedIn, (req, res) => res.render('users/login', { error: req.query.error }));


  //-------------------------------------------------------------------------------------------------------------------
  //This one directly below can be useful for a "myAccount" page, but that is something that is nice to have and it not required
  /*
  router.get('/account', (req, res, next) => {
    if (req.user) return next();
    return res.status(401).end();
  }, (req, res) => res.render('users/account', { user: req.user }));
  */
  /*
  router.get('/avatar/:filename', (req, res) => {
    res.type('png');
    return res.sendFile(avatars.filepath(req.params.filename));
  });

  router.get('/avatartn/:filename', apicache.middleware('1 minute'), async (req, res) => {
    res.type('png');
    const tn = await avatars.thumbnail(req.params.filename);
    return res.end(tn, 'binary');
  });

  router.get('/login', redirectIfLoggedIn, (req, res) => {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
      <title>THIS IS STUDENT LOGIN</title>
      </head>
      <body>
      <form action="/login" method="post">
    <div>
        <label>Email:</label>
        <input type="text" name="email"/>
    </div>
    <div>
        <label>Password:</label>
        <input type="password" name="password"/>
    </div>
    <div>
        <input type="submit" value="Log In"/>
    </div>
    </form>
      </body>
      </html>
    `)
  }); //I am 95% certain that this works correctly
  //router.get('/login', redirectIfLoggedIn, (req, res) => res.render('users/login', { error: req.query.error }));


    router.get('/TutorLogin', redirectIfLoggedIn);

  router.get('/', (req, res) => {
    res.send("this is home")
  })

  
  router.get('/Schedule', (req, res) => {
    res.send("this is schedule")
  })

  router.get('/TutorLogin', (req, res) => {
    res.send("this is Tutor login")
  })
*/

/*
  router.post('/Schedule.html', async (req, res, next) => {
    try {
      req.session.tutor = req.body.tutor;
      req.session.course = req.body.course;
  
      const tutorUpdate = await TutorModel.findByIdAndUpdate({id: req.body.tutor.id}, {currentlyWorking: true}); //callback?
  
      if(tutorUpdate) return res.redirect('/Schedule/Payment');
      return next(new Error('Error updating tutor'))
    } catch (err) {
      return next(err); //redirect somewhere else?
    }
  });
  */
  //-------------------------------------------------------------------------------------------------------------------
  //for testing purposes

  //