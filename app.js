const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const secrets = require("./secrets");
const path = require("path");
const multer = require("multer");
const graphqlHttp = require("express-graphql");
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolver");
const mongoDbUri = secrets.mongoDbUri;
const auth = require("./middlewares/auth");
const app = express();

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "images");
	},
	filename: (req, file, cb) => {
		cb(
			null,
			new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
		);
	},
});

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === "image/png" ||
		file.mimetype === "image/jpg" ||
		file.mimetype === "image/jpeg"
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

app.use("/images", express.static(path.join(__dirname, "images")));
app.use(bodyParser.json());
app.use(
	multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, PATCH, DELETE"
	);
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

	// Express graphQl does not permit option request
	// So we need to send an empty 200 response back
	if (req.method === "OPTIONS") {
		return res.sendStatus(200);
	}
	next();
});

app.use(auth);

app.use("/post-image", (req, res, next) => {
	if (!req.isAuth) {
		res.status(401).json({
			message: "Not Authenticated",
		});
	}
	if (!req.file) {
		return res.status(500).json({
			message: "No file provided",
		});
	}
	const imageUrl = req.file.path.replace("\\", "/");
	return res.status(201).json({
		message: "Image stored successfully",
		imageUrl: imageUrl,
	});
});

app.use(
	"/graphql",
	graphqlHttp({
		schema: graphqlSchema,
		rootValue: graphqlResolver,
		graphiql: true,
		customFormatErrorFn(err) {
			if (!err.originalError) {
				return err;
			}
			const data = err.originalError.data;
			const message = err.message || "An error occured";
			const code = err.originalError.code || 500;
			return {
				message: message,
				status: code,
				data: data,
			};
		},
	})
);

mongoose
	.connect(mongoDbUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then((result) => {
		console.log("connected to mongoDb Database");
		console.log("server started at port " + secrets.port);
		app.listen(secrets.port);
	})
	.catch((err) => console.log(err));
