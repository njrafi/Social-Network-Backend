const jwt = require("jsonwebtoken");
const secrets = require("../secrets");

module.exports = (req, res, next) => {
	const authHeader = req.get("Authorization");
	if (!authHeader) {
		req.isAuth = false;
		return next();
	}
	// Because first word is "bearer"
	const token = authHeader.split(" ")[1];
	console.log("token", token);
	let decodedToken;
	try {
		decodedToken = jwt.verify(token, secrets.jwtSecretKey);
	} catch (err) {
		req.isAuth = false;
		return next();
	}

	if (!decodedToken) {
		req.isAuth = false;
		return next();
	}

	console.log("Auth successful");
	console.log("userId", decodedToken.userId);
	req.userId = decodedToken.userId;
	req.isAuth = true;
	next();
};
