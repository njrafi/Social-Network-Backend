const User = require("../models/user");
const Post = require("../models/post");
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
				error.code = 401;
				throw error;
			}
			const passwordMatched = await bcrypt.compare(password, user.password);
			if (!passwordMatched) {
				const error = new Error("Wrong password");
				error.code = 401;
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

	createPost: async function (args, req) {
		if (!req.isAuth) {
			const error = new Error("Not Authinticated");
			error.code = 401;
			throw error;
		}

		console.log("In Create Post");
		const title = args.postInput.title;
		const content = args.postInput.content;
		const imageUrl = args.postInput.imageUrl;
		const userId = req.userId;
		const errors = [];
		if (!validator.isLength(title, { min: 5 })) {
			errors.push("Title is invalid");
		}
		if (!validator.isLength(content, { min: 5 })) {
			errors.push("Content is invalid");
		}
		if (errors.length > 0) {
			const error = new Error("Invalid Input");
			error.data = errors;
			error.code = 422;
			throw error;
		}
		try {
			const user = await User.findById(userId);
			if (!user) {
				const error = new Error("User Does not exist");
				error.code = 401;
				throw error;
			}
			const post = new Post({
				title: title,
				content: content,
				creator: user,
				imageUrl: imageUrl,
			});
			const createdPost = await post.save();
			user.posts.push(createdPost);
			await user.save();
			return {
				...createdPost._doc,
				createdAt: createdPost.createdAt.toISOString(),
				updatedAt: createdPost.updatedAt.toISOString(),
			};
		} catch (err) {
			err.code = 500;
			throw err;
		}
	},

	getPosts: async function (args, req) {
		if (!req.isAuth) {
			const error = new Error("Not Authinticated");
			error.code = 401;
			throw error;
		}
		console.log("In get Posts");
		const currentPage = req.query.page || 1;
		const perPageItem = 2;
		try {
			const totalItems = await Post.find().countDocuments();
			// Pagination
			const posts = await Post.find()
				.sort({ createdAt: -1 })
				.skip((currentPage - 1) * perPageItem)
				.limit(perPageItem)
				.populate("creator");
			if (!posts) {
				const error = new Error("Could not find any Post");
				error.code = 404;
				throw error;
			}
			return {
				posts: posts.map((p) => {
					return {
						...p._doc,
						createdAt: p.createdAt.toISOString(),
						updatedAt: p.updatedAt.toISOString(),
					};
				}),
				totalItems: totalItems,
			};
		} catch (err) {
			err.code = 500;
			throw err;
		}
	},

	getPost: async function (args, req) {
		if (!req.isAuth) {
			const error = new Error("Not Authinticated");
			error.code = 401;
			throw error;
		}
		console.log("In get a single Post");
		const postId = args.postId;
		try {
			const post = await Post.findById(postId).populate("creator");
			if (!post) {
				const error = new Error("Could not find Post");
				error.statusCode = 404;
				throw error;
			}
			return {
				...post._doc,
				createdAt: post.createdAt.toISOString(),
				updatedAt: post.updatedAt.toISOString(),
			};
		} catch (err) {
			err.code = 500;
			throw err;
		}
	},
};
