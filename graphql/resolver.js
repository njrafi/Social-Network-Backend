const User = require("../models/user");
const bcrypt = require("bcryptjs");

module.exports = {
	createUser: async function (args, req) {
		const email = args.userInput.email;
		const name = args.userInput.name;
		const password = args.userInput.name;
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
		}
	},
};
