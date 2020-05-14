const User = require("../models/user");
const expect = require("chai").expect;
const sinon = require("sinon");
const AuthController = require("../controllers/auth");
const StatusController = require("../controllers/status");
const mongoose = require("mongoose");
const secrets = require("../secrets");

describe("Auth Controller - Login", () => {
	it("should throw an error if accessing the database fails", async () => {
		sinon.stub(User, "findOne");
		User.findOne.throws();
		const req = {
			body: {
				name: "dummy name",
				email: "dummy email",
			},
		};
		result = await AuthController.login(req, {}, () => {});
		expect(result).to.be.an("error");
		expect(result).to.have.property("statusCode", 500);
		User.findOne.restore();
	});

	it("should send a response with a valid user status for an existing user", async () => {
		try {
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

			const savedUser = await user.save();

			const req = { userId: "5ebb1aca3bd39a4e88d5d3a2" };
			const res = {
				statusCode: 500,
				userStatus: null,
				status: function (code) {
					this.statusCode = code;
					return this;
				},
				json: function (data) {
					this.userStatus = data.status;
				},
			};

			await StatusController.getStatus(req, res, () => {});
			expect(res.statusCode).to.be.equal(200);
			expect(res.userStatus).to.be.equal("test Status");
		} catch (error) {
			expect(error).to.be.null;
		} finally {
			await User.deleteMany({});
			mongoose.disconnect();
		}
	});
});
