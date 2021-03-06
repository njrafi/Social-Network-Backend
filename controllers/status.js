const User = require("../models/user");
const { validationResult } = require("express-validator");

exports.getStatus = async (req, res, next) => {
	console.log("in Get Status");

	try {
		const user = await User.findById(req.userId);

		return res.status(200).json({
			message: "User Status",
			status: user.status,
		});
	} catch (err) {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
		return err;
	}
};

exports.updateStatus = (req, res, next) => {
	console.log("In Update Status");
	const newStatus = req.body.status;
	console.log("new status: ", newStatus);
	User.findById(req.userId)
		.then((user) => {
			user.status = newStatus;
			return user.save();
		})
		.then((result) => {
			return res.status(200).json({
				message: "Updated User Status",
				status: newStatus,
			});
		})
		.catch((err) => {
			if (!err.statusCode) {
				err.statusCode = 500;
			}
			next(err);
		});
};
