const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secrets = require("../secrets");

exports.login = async (req, res, next) => {
	console.log("In signUp route");
	console.log(req.body);

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error("Validation Failed, Entered Data is incorrect.");
		error.statusCode = 422;
		error.data = errors.array();
		throw error;
	}

	const email = req.body.email;
	const password = req.body.password;
	let loadedUser;
	try {
		const user = await User.findOne({ email: email });

		if (!user) {
			const error = new Error("User Not found.Check your email");
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		loadedUser = user;
		const matched = await bcrypt.compare(password, user.password);

		if (!matched) {
			const error = new Error("Wrong password");
			error.statusCode = 422;
			error.data = errors.array();
			throw error;
		}
		const token = jwt.sign(
			{
				email: loadedUser.email,
				userId: loadedUser._id.toString(),
			},
			secrets.jwtSecretKey,
			{
				expiresIn: "1h",
			}
		);

		console.log("Login Successfully");
		return res.status(200).json({
			message: "Login Successfully",
			userId: loadedUser._id,
			token: token,
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
		return err;
	}
	return;
};

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
