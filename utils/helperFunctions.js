const path = require("path");
const fs = require("fs");

module.exports = deleteImage = (filePath) => {
	filePath = path.join(__dirname, "..", filePath);
	fs.unlink(filePath, (err) => {
		console.log(err);
	});
};
