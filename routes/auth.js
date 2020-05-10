const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/auth");
const User = require("../models/user");
const router = express.Router();

router.put(
	"/signup",
	[
		body("email")
			.isEmail()
			.withMessage("Please enter an Email Address")
			.custom((value, { req }) => {
				return User.findOne({ email: value }).then((userDoc) => {
					if (userDoc) {
						return Promise.reject("E-mail address already exists!");
					}
				});
			})
			.normalizeEmail(),
		body("name"),
		body("password").trim().isLength({ min: 5 }),
	],
	authController.signUp
);

module.exports = router;
