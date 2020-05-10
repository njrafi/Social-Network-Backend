const express = require("express");
const { body } = require("express-validator");
const statusController = require("../controllers/status");
const isAuth = require("../middlewares/is-auth");
const router = express.Router();


router.get("/", isAuth, statusController.getStatus);
router.post("/", isAuth, statusController.updateStatus);

module.exports = router;