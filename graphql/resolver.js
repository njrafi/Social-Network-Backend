const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("validator");

module.exports = {
	createUser: async function (args, req) {
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
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			throw err;
		}
	},
};
