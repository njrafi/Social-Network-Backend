const User = require("../models/user");
const Post = require("../models/post");
const expect = require("chai").expect;
const sinon = require("sinon");
const FeedController = require("../controllers/feed");
const mongoose = require("mongoose");
const secrets = require("../secrets");
const io = require("../socket");

describe("Feed Controller", () => {
	before(async () => {
		await mongoose.connect(secrets.testMongoDbUri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		const user = new User({
			email: "dummy@dummy.com",
			password: "tester",
			name: "dummy",
			posts: [],
			_id: "5ebb1aca3bd39a4e88d5d3a2",
			status: "test Status",
		});
		sinon.stub(io, "getIO");
		io.getIO.returns({
			emit: () => {},
		});
		await user.save();
	});

	it("should add a created post to the posts of the creator", async () => {
		const req = {
			body: {
				title: "Dummy post",
				content: "Dummy Content",
			},
			file: {
				path: "dummy path",
			},
			userId: "5ebb1aca3bd39a4e88d5d3a2",
		};

		const res = {
			status: function () {
				return this;
			},
			json: () => {},
		};

		const user = await FeedController.createPost(req, res, () => {});
		expect(user).to.have.property("posts");
		expect(user.posts).to.have.length(1);
	});

	after(async () => {
		io.getIO.restore();
		await User.deleteMany({});
		mongoose.disconnect();
	});
});
