const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const secrets = require("../secrets");

module.exports = {
	createUser: async function (args, req) {
		console.log("In create User");
		const email = args.userInput.email;
		const name = args.userInput.name;
		const password = args.userInput.password;

		const errors = [];
		if (!validator.isEmail(email)) {
			errors.push({ message: "E-mail is invalid." });
		}
		if (!validator.isLength(password, { min: 5 })) {
			errors.push({ message: "Password is too short" });
		}

		if (errors.length > 0) {
			const error = new Error("Invalid Input");
			error.data = errors;
			error.code = 422;
			throw error;
		}

		try {
			const existingUser = await User.findOne({ email: email });
			if (existingUser) {
				const error = new Error("User Exists already");
				throw error;
			}
			const hashedPassword = await bcrypt.hash(password, 12);
			const newUser = new User({
				email: email,
				password: hashedPassword,
				name: name,
			});
			const createdUser = await newUser.save();
			console.log(createdUser);
			console.log("User Created Successfully");
			return { ...createdUser._doc, _id: createdUser._id.toString() };
		} catch (err) {
			err.code = 500;
			throw err;
		}
	},

	login: async function (args, req) {
		console.log("In Login");
		console.group(args);
		const email = args.email;
		const password = args.password;

		const errors = [];
		if (!validator.isEmail(email)) {
			errors.push({ message: "E-mail is invalid." });
		}
		if (!validator.isLength(password, { min: 5 })) {
			errors.push({ message: "Password is too short" });
		}
		if (errors.length > 0) {
			const error = new Error("Invalid Input");
			error.data = errors;
			error.code = 422;
			throw error;
		}

		try {
			const user = await User.findOne({ email: email });
			if (!user) {
				const error = new Error("User Not found.Check your email");
				error.code = 422;
				throw error;
			}
			const passwordMatched = await bcrypt.compare(password, user.password);
			console.log(passwordMatched);
			if (!passwordMatched) {
				const error = new Error("Wrong password");
				error.code = 422;
				throw error;
			}
			const token = jwt.sign(
				{
					email: user.email,
					userId: user._id.toString(),
				},
				secrets.jwtSecretKey,
				{
					expiresIn: "1h",
				}
			);
			return {
				token: token,
				userId: user._id.toString(),
			};
		} catch (err) {
			err.code = 500;
			throw err;
		}
	},
};
