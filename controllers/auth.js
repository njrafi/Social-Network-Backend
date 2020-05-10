const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

exports.signUp = (req, res, next) => {
	console.log("In signUp route");
	console.log(req.body);

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error("Validation Failed, Entered Data is incorrect.");
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}

	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;

	bcrypt
		.hash(password, 12)
		.then((hashedPassword) => {
			// Creating a new user
			const newUser = new User({
				email: email,
				password: hashedPassword,
				name: name,
			});
			return newUser.save();
		})
		.then((result) => {
			console.log(result);
			console.log("User Created Successfully");
			return res.status(201).json({
                message: "User Created Successfully",
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};
