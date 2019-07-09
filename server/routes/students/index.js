/*--------Route key (for later)---------------
Use Ctrl + F to find and replace these;
/About                ==
/StudentLogin         == /Login.html
/StudentCreate        == /Create.html
/Schedule             == /Schedule.html
  /Schedule/Payment   ==
  /Schedule/Confirm   ==
/StudentLogout        == /StudentLogout
/StudentUpdate        ==
--------------------------------------------*/
const express = require('express');
const passport = require('passport');
//const apicache = require('apicache');
const StudentModel = require('../../models/StudentModel');

const router = express.Router();

//I am 95% certain that this works correctly
function redirectIfLoggedIn (req, res, next) {
  if (req.user) {
    console.log('redirecting, as the user is already logged in');
    return res.redirect('/Schedule.html');
  }
  return next(); //this is only really useful if the if statement doesnt execute
}

module.exports = () => {
  
  //This route works
  router.post('/Login.html', passport.authenticate('local', {
    successRedirect: '/Schedule.html',
    failureRedirect: '/Login.html?error=true',
  }));

  //I am 95% certain that this route works correctly
  router.get('/StudentLogout', (req, res) => { //how to test this?
    req.logout();
    return res.redirect('/');
  });

  //This works, however I need to determine how to deal with errors without crashing the server
  //and letting the user know what went wrong in a professional way (ex we dont want a 404 page or something like that)
  //I want to be able to tell them on the page that the stuff is wrong (this is where socket.io comes in, especially if
  //I am using actual forms to send the data rather than JQuery)
  router.post('/StudentCreate', async (req, res, next) => {
    try {
      const user = new StudentModel({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber
      });

      const savedUser = await user.save();

      if (savedUser) return res.redirect('/Login.html'); //this should be either schedule or login, depending on if this serializes a session
      return next(new Error('Failed to save user for unknown reasons'));
    } catch (err) {
      console.log(err.code); //log.error (later problem)
      return next(err);
      //return res.send('Error: 11000: Cannot save a duplicate user')
    }
  });

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

  //I am 95% certain that this works correctly
  //router.get('/Login.html', redirectIfLoggedIn, (req, res) => res.render('users/login', { error: req.query.error }));

  //-------------------------------------------------------------------------------------------------------------------
  //for testing purposes
  router.get('/', (req, res) => {
    res.send("this is home")
  })

  
  router.get('/Schedule', (req, res) => {
    console.log(req.session.id);
    res.send("this is schedule")
  })
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
  */

  return router;
};
