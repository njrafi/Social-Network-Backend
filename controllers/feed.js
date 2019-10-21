const { validationResult } = require("express-validator");

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
		console.log(errors);
		return res.status(422).json({
			message: "Validation Failed, Entered Data is incorrect.",
			errors: errors.array()
		});
	}
	console.log(req.body);
	const title = req.body.title;
	const content = req.body.content;
	if (!title || !content) {
		console.log(title);
		console.log(content);
		return res.status(400).json({
			message: "Post Creation Failed. Title or Content is Empty"
		});
	}
	console.log("Post Created Successfully!");
	res.status(201).json({
		message: "Post Created Successfully!",
		post: {
			_id: new Date().toISOString(),
			title: title,
			content: content,
			creator: { name: "Nj front" },
			createdAt: new Date()
		}
	});
};
