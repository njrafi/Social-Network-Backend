const { validationResult } = require("express-validator");
const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
	console.log("In get Posts");
	res.status(200).json({
		posts: [
			{
				_id: "1",
				title: "First Post",
				content: "This is the first Post!",
				imageUrl: "/images/duck.jpg",
				creator: {
					name: "NJRafi"
				},
				createdAt: new Date()
			}
		]
	});
};

exports.createPost = (req, res, next) => {
	console.log("In Create Post");

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error("Validation Failed, Entered Data is incorrect.");
		error.statusCode = 422;
		throw error;

		// return res.status(422).json({
		// 	message: "Validation Failed, Entered Data is incorrect.",
		// 	errors: errors.array()
		// });
	}
	console.log(req.body);
	const title = req.body.title;
	const content = req.body.content;
	const post = new Post({
		title: title,
		content: content,
		creator: { name: "Nj front" }
	});

	post
		.save()
		.then(result => {
			console.log(result);
			console.log("Post Created Successfully!");
			return res.status(201).json({
				message: "Post Created Successfully!",
				post: result
			});
		})
		.catch(err => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};
