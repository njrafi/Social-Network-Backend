const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const path = require("path");
const fs = require("fs");

exports.getPosts = async (req, res, next) => {
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
			error.statusCode = 404;
			throw error;
		}
		return {
			posts: posts,
			totalItems: totalItems,
		};
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	}
};

exports.getPost = (req, res, next) => {
	console.log("In get a single post");
	const postId = req.params.postID;
	console.log("post id: ", postId);
	Post.findById(postId)
		.populate("creator")
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
	const userId = req.userId;
	const post = new Post({
		title: title,
		content: content,
		creator: userId,
		imageUrl: imageUrl,
	});

	let creator;

	post
		.save()
		.then((result) => {
			return User.findById(userId);
		})
		.then((user) => {
			user.posts.push(post);
			creator = user;
			return user.save();
		})
		.then((result) => {
			post.creator = creator;
			console.log("Post Created Successfully!");
			return res.status(201).json({
				message: "Post Created Successfully!",
				post: post,
				creator: { _id: creator._id, name: creator.name },
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
		.populate("creator")
		.then((post) => {
			if (!post) {
				const error = new Error("Could not find Post");
				error.statusCode = 404;
				throw error;
			}
			if (post.creator._id != req.userId) {
				const error = new Error("Can not edit other's post");
				error.statusCode = 403;
				throw error;
			}
			post.title = title;
			post.content = content;
			if (imageUrl && !imageUrl.isEmpty()) {
				if (post.imageUrl) deleteImage(post.imageUrl);
				post.imageUrl = imageUrl;
			}
			// TODO: Delete previous URL
			return post.save();
		})
		.then((post) => {
			console.log(post);
			console.log("Post Edited Successfully!");
			return res.status(201).json({
				message: "Post Edited Successfully!",
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
			if (post.creator != req.userId) {
				const error = new Error("Can not Delete other's post");
				error.statusCode = 403;
				throw error;
			}
			if (post.imageUrl) deleteImage(post.imageUrl);
			return Post.findByIdAndRemove(postId);
		})
		.then((result) => {
			return User.findById(req.userId);
		})
		.then((user) => {
			user.posts.pull(postId);
			return user.save();
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
