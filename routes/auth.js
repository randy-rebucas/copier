var express = require("express");
var router = express.Router();

const controller = require("../controllers/auth");

/* GET home page. */
router.get("/refreshAccessToken", controller.refreshAccessToken);

router.get("/requestAccessToken/:code", controller.requestAccessToken);

module.exports = router;
