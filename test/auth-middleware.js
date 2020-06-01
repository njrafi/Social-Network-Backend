const authMiddleWare = require("../middlewares/is-auth");
const expect = require("chai").expect;
const jwt = require("jsonwebtoken");
const sinon = require("sinon");
const dotenv = require("dotenv");

describe("Auth Middleware", () => {
	it("should yield a userId after decoding the token", () => {
		dotenv.config();
		const req = {
			get: (headerName) => {
				return "Bearer dummy";
			},
		};
		// mocking jsw
		sinon.stub(jwt, "verify");
		jwt.verify.returns({
			userId: "abc",
		});
		authMiddleWare(req, {}, () => {});
		expect(req).to.have.property("userId");
		expect(req).to.have.property("userId", "abc");
		expect(jwt.verify.called).to.be.true;
		jwt.verify.restore();
	});

	it("should throw an error if no authorization header is preset", () => {
		const req = {
			get: () => {
				return null;
			},
		};
		expect(authMiddleWare.bind(this, req, {}, () => {})).to.throw(
			"No Authorization header"
		);
	});

	it("should throw an error if the authorization header is only one string", () => {
		const req = {
			get: (headerName) => {
				return "dummy";
			},
		};
		expect(authMiddleWare.bind(this, req, {}, () => {})).to.throw();
	});

	it("should throw an error if the token cannot be verified", () => {
		const req = {
			get: (headerName) => {
				return "Bearer dummy";
			},
		};
		expect(authMiddleWare.bind(this, req, {}, () => {})).to.throw();
	});
});
