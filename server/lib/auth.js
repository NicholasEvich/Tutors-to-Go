//This service is exclusively for authorizing student logins

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const StudentModel = require('../models/StudentModel.js');

//The stuff below is from the meetup app

passport.use(new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
  try {
    const user = await StudentModel.findOne({ email: username }).exec();
    if (!user) {
      return done(null, false, { message: 'Invalid username or password' });
    }
    const passwordOK = await user.comparePassword(password);
    if (!passwordOK) {
      return done(null, false, { message: 'Invalid username or password' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// eslint-disable-next-line no-underscore-dangle
passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await StudentModel.findById(id).exec();
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

module.exports = {
  initialize: passport.initialize(),
  session: passport.session(),
  setUser: (req, res, next) => {
    res.locals.user = req.user;
    return next();
  },
};
