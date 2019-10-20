exports.getPosts = (req, res, next) => {
	console.log("In get Posts");
	res.status(200).json({
		posts: [{ title: "First Post", content: "This is the first Post!" }]
	});
};

exports.createPost = (req, res, next) => {
	console.log("In Create Post");
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
	res.status(201).json({
		message: "Post Created Successfully!",
		post: { id: new Date().toISOString(), title: title, content: content }
	});
};
