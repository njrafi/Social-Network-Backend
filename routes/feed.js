const express = require("express");
const { body } = require("express-validator");
const feedController = require("../controllers/feed");
const isAuth = require("../middlewares/is-auth");
const router = express.Router();

// Get /feed/posts
router.get("/posts", isAuth, feedController.getPosts);
router.get("/post/:postID", isAuth, feedController.getPost);

router.post(
	"/post",
	[
		body("title").trim().isLength({ min: 5 }),
		body("content").trim().isLength({ min: 5 }),
	],
	isAuth,
	feedController.createPost
);

router.put(
	"/post/:postID",
	[
		body("title").trim().isLength({ min: 5 }),
		body("content").trim().isLength({ min: 5 }),
	],
	isAuth,
	feedController.updatePost
);

router.delete("/post/:postID", isAuth, feedController.deletePost);

module.exports = router;
