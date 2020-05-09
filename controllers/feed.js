const { validationResult } = require("express-validator");
const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
	console.log("In get Posts");

	Post.find()
		.then((posts) => {
			if (!posts) {
				const error = new Error("Could not find any Post");
				error.statusCode = 404;
				throw error;
			}
			return res.status(200).json({
				posts: posts,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.getPost = (req, res, next) => {
	console.log("In get a single post");
	const postId = req.params.postID;
	console.log(postId);
	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error("Could not find Post");
				error.statusCode = 404;
				throw error;
			}

			return res.status(200).json({
				message: "Post Fetched",
				post: post,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

exports.createPost = (req, res, next) => {
	console.log("In Create Post");

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error("Validation Failed, Entered Data is incorrect.");
		error.statusCode = 422;
		throw error;
	}
	console.log(req.body);
	const title = req.body.title;
	const content = req.body.content;
	const post = new Post({
		title: title,
		content: content,
		creator: { name: "Nj front" },
	});

	post
		.save()
		.then((result) => {
			console.log(result);
			console.log("Post Created Successfully!");
			return res.status(201).json({
				message: "Post Created Successfully!",
				post: result,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};
