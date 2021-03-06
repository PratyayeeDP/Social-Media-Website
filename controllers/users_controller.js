const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const uniquekey = require("../models/reset_password");
const resetPasswordMailer = require("../mailers/forgot_password");

module.exports.profile = async function (req, res) {
  //return res.end('<h1>User Profile</h1>');
  try {
    let user = await User.findById(req.params.id);
    let currUser = await User.findById(req.user._id);
    let isFollower = currUser.following.indexOf(user._id) == -1 ? false : true;

    return res.render("user_profile", {
      title: "User Profile",
      profile_user: user,
      isFollower: isFollower,
    });
  } catch (err) {
    console.log("Error occured in profile controller!");
    return;
  }
};

module.exports.update = async function (req, res) {
  if (req.user.id == req.params.id) {
    try {
      let user = await User.findById(req.params.id);
      User.uploadedAvatar(req, res, function (err) {
        if (err) {
          console.log("******Multer Error:", err);
        }
        user.name = req.body.name;
        user.email = req.body.email;
        user.about = req.body.about;
        if (req.file) {
          if (user.avatar) {
            fs.unlinkSync(path.join(__dirname, "..", user.avatar));
          }

          // this is saving the path of the uploaded file into the avatar field in the user
          user.avatar = User.avatarPath + "/" + req.file.filename;
        }
        user.save();
        return res.redirect("back");
      });
    } catch (err) {
      req.flash("error", err);
      return res.redirect("back");
    }
  } else {
    req.flash("error", "Unauthorized!");
    return res.status(401).send("Unauthorized");
  }
};

//render the sign-up page
module.exports.signUp = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/profile");
  }
  return res.render("user_sign_up", {
    title: "Codeial | Sign Up",
  });
};

//render the sign-in page
module.exports.signIn = function (req, res) {
  return res.render("user_sign_in", {
    title: "Codeial | Sign In",
  });
};

//get the sign-up data
module.exports.create = function (req, res) {
  if (req.body.password != req.body.confirm_password) {
    return res.redirect("back");
  }
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      console.log("error in finding user in signing up");
      return;
    }
    if (!user) {
      User.create(req.body, function (err, user) {
        if (err) {
          console.log("error in creating user while signing up");
          return;
        }
        return res.redirect("/users/sign-in");
      });
    } else {
      return res.redirect("back");
    }
  });
};

//get the sign-in data to create the session for the user
module.exports.createSession = function (req, res) {
  //flash message of logging-in:
  req.flash("success", "Logged In successfully");
  return res.redirect("/");
};

module.exports.destroySession = function (req, res) {
  req.logout();
  //flash message of logging-out:
  req.flash("success", "You have logged out!");
  return res.redirect("/");
};

module.exports.forgot_password = function (req, res) {
  return res.render("user_forgot_password", {
    title: "Codeial | Forgot Password",
  });
};

module.exports.createUniqueKey = async function (req, res) {
  // console.log("createuniquekey");
  // console.log(req.body.email);
  // return res.redirect("back");

  try {
    let user = await User.findOne({ email: req.body.email });
    console.log(user);
    if (user) {
      let uid = uuidv4();
      let newtoken = await uniquekey.create({
        user: user,
        uniqueKey: uid,
        isValid: true,
      });
      console.log(user.email);
      resetPasswordMailer.newpasswordlink(newtoken);

      return res.redirect("back");
    } else {
      req.flash("error", "Unauthorized!");
      return res.render("user_sign_up", {
        title: "Codeial | Sign Up",
      });
    }
  } catch (err) {
    console.log("Error");
  }
};

module.exports.resetPasswordPage = async function (req, res) {
  //console.log(req.params.uniquekey);
  let uniqueid = await uniquekey.findOne({
    uniqueKey: req.params.uniquekey,
  });
  // let user = await User.findById(uniqueid.user);
  // console.log(user);
  return res.render("reset_password_page", {
    title: "Codeial | Reset Password",
    uniquekey: uniqueid,
  });
};

module.exports.updatePassword = function (req, res) {
  uniquekey.findOneAndUpdate(
    { uniqueKey: req.params.uniquekey },
    { isValid: false },
    function (err, uniqueid) {
      if (uniqueid.isValid == true) {
        if (req.body.password != req.body.confirm_password) {
          req.flash("Passwords don't match!");
          return res.redirect("back");
        }
        User.findByIdAndUpdate(
          uniqueid.user,
          { password: req.body.password },
          function (err, user) {
            if (err) {
              console.log("Error");
              return;
            }
            req.flash("Password updated successfully!");
            return res.redirect("/users/sign-in");
          }
        );
      }
    }
  );
};

module.exports.follow = async function (req, res) {
  try {
    let toUser = await User.findById(req.params.id);
    let fromUser = await User.findById(req.user._id);
    let index = toUser.followers.indexOf(fromUser._id);
    if (index != -1) {
      return res.redirect("back");
    } else {
      toUser.followers.push(fromUser);
      fromUser.following.push(toUser);
      console.log(toUser);
      console.log(fromUser);
      toUser.save();
      fromUser.save();
      return res.redirect("back");
    }
  } catch {
    console.log("Error in follow controller!");
  }
};

module.exports.unfollow = async function (req, res) {
  try {
    let toUser = await User.findById(req.params.id);
    let fromUser = await User.findById(req.user._id);
    let index1 = toUser.followers.indexOf(fromUser._id);
    let index2 = fromUser.following.indexOf(toUser._id);
    if (index1 == -1 || index2 == -1) {
      return res.redirect("back");
    }
    toUser.followers.splice(index1, 1);
    fromUser.following.splice(index2, 1);
    toUser.save();
    fromUser.save();
    return res.redirect("back");
  } catch {
    console.log("Error in unfollow controller!");
  }
};
