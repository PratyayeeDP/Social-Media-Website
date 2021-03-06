//require express:
const express = require("express");
const router = express.Router();

//require passport:
const passport = require("passport");

const usersController = require("../controllers/users_controller");
//const friendship_controller = require("../controllers/friendship_controller");
router.get(
  "/profile/:id",
  passport.checkAuthentication,
  usersController.profile
);
//router.get('/profile/:id/toggle_friend', friendship_controller.toggle_friendship);
router.post(
  "/update/:id",
  passport.checkAuthentication,
  usersController.update
);

router.get("/sign-up", usersController.signUp);
router.get("/sign-in", usersController.signIn);
router.post("/create", usersController.create);
router.get("/forgot_password", usersController.forgot_password);
//use passport as a middleware to authenticate:
router.post(
  "/create-session",
  passport.authenticate("local", { failureRedirect: "/users/sign-in" }),
  usersController.createSession
);

router.get("/sign-out", usersController.destroySession);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/users/sign-in" }),
  usersController.createSession
);

router.post("/create_unique_key", usersController.createUniqueKey);
router.get("/reset-password/:uniquekey", usersController.resetPasswordPage);
router.post("/update-password/:uniquekey", usersController.updatePassword);
router.get("/unfollow/:id", usersController.unfollow);
router.get("/follow/:id", usersController.follow);
module.exports = router;
