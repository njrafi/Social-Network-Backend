const { validationResult } = require("express-validator");
const Post = require("../models/post");
const path = require("path");
const fs = require("fs");

exports.getPosts = (req, res, next) => {
	console.log("In get Posts");
	const currentPage = req.query.page || 1;
	const perPageItem = 2;
	let totalItems;

	Post.find()
		.countDocuments()
		.then((count) => {
			totalItems = count;
			// Pagination
			return Post.find()
				.skip((currentPage - 1) * perPageItem)
				.limit(perPageItem);
		})
		.then((posts) => {
			if (!posts) {
				const error = new Error("Could not find any Post");
				error.statusCode = 404;
				throw error;
			}
			return res.status(200).json({
				posts: posts,
				totalItems: totalItems,
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
	console.log("post id: ", postId);
	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error("Could not find Post");
				error.statusCode = 404;
				error.data = errors.array();
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
		error.data = errors.array();
		throw error;
	}
	console.log(req.body);
	const title = req.body.title;
	const content = req.body.content;
	const imageUrl = req.file.path.replace("\\", "/");
	const post = new Post({
		title: title,
		content: content,
		creator: { name: "Nj front" },
		imageUrl: imageUrl,
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

exports.updatePost = (req, res, next) => {
	console.log("In update post");
	const postId = req.params.postID;
	const title = req.body.title;
	const content = req.body.content;
	let imageUrl = "";
	if (req.file) imageUrl = req.file.path.replace("\\", "/");
	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error("Could not find Post");
				error.statusCode = 404;
				throw error;
			}
			post.title = title;
			post.content = content;
			if (imageUrl) {
				if (post.imageUrl) deleteImage(post.imageUrl);
				post.imageUrl = imageUrl;
			}
			// TODO: Delete previous URL
			return post.save();
		})
		.then((result) => {
			console.log(result);
			console.log("Post Edited Successfully!");
			return res.status(201).json({
				message: "Post Edited Successfully!",
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

exports.deletePost = (req, res, next) => {
	console.log("In Delete post");
	const postId = req.params.postID;
	Post.findById(postId)
		.then((post) => {
			if (!post) {
				const error = new Error("Could not find Post");
				error.statusCode = 404;
				throw error;
			}
			if (post.imageUrl) deleteImage(post.imageUrl);
			return Post.deleteOne({ _id: postId });
		})
		.then((result) => {
			console.log("Post Deleted Successfully");
			return res.status(200).json({
				message: "Post Deleted Successfully!",
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};

const deleteImage = (filePath) => {
	filePath = path.join(__dirname, "..", filePath);
	fs.unlink(filePath, (err) => {
		console.log(err);
	});
};
