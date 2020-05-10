const jwt = require("jsonwebtoken");
const secrets = require("../secrets");

module.exports = (req, res, next) => {
	const authHeader = req.get("Authorization");
	if (!authHeader) {
		const error = new Error("No Authorization header");
		error.statusCode = 401;
		throw error;
	}
	// Because first word is "bearer"
	const token = authHeader.split(" ")[1];
	console.log("token", token);
	let decodedToken;
	try {
		decodedToken = jwt.verify(token, secrets.jwtSecretKey);
	} catch (err) {
		err.statusCode = 500;
		throw err;
	}

	if (!decodedToken) {
		const error = new Error("Not Authenticated.");
		error.statusCode = 401;
		throw error;
	}

	console.log("Auth successful");
	console.log("userId", decodedToken.userId);
	req.userId = decodedToken.userId;
	next();
};
