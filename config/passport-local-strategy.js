//import passport:
const passport = require("passport");

//require the passport local library specifically the Strategy:
const LocalStrategy = require("passport-local").Strategy;

//require user:
const User = require("../models/user");

//tell passport to use the Strategy: steps of authentication using passport:
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    //there are three arguments in the function: done is the callback argument.
    function (req, email, password, done) {
      //find the user and establish the identity:
      User.findOne({ email: email }, function (err, user) {
        //error found:
        if (err) {
          req.flash("error", err);
          return done(err);
        }
        //user not found:
        if (!user || user.password != password) {
          req.flash("error", "Invalid Username/Password");
          return done(null, false);
        }
        //user found:
        return done(null, user);
      });
    }
  )
);

//serializing the user to decide which key is to be kept in the cookies:
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

//deserializing the user from the key in the cookies:
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    //error found:
    if (err) {
      console.log("Error in finding user --> Passport");
      return done(err);
    }
    //user found:
    return done(null, user);
  });
});

//check if user is authenticated:
passport.checkAuthentication = function (req, res, next) {
  //if user is signed in: pass on the request to the next function(controller's action)
  if (req.isAuthenticated()) {
    return next();
  }
  //if user is not signed in: redirect to the sign-in page:
  return res.redirect("./sign-in");
};

passport.setAuthenticatedUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    //req.user contains the current signed in user from the session cookie and we are just sending this to the locals for the views
    res.locals.user = req.user;
  }
  next();
};
//export passport: not the strategy:
module.exports = passport;
