var express = require("express");
var router = express.Router();

const controller = require("../controllers/auth");

/**
 * loads middlewares
 */
const infusionsoft = require("../middlewares/sessionStorage");

/* GET home page. */
router.get("/refreshAccessToken", infusionsoft, controller.refreshAccessToken);

router.get("/requestAccessToken/:code", infusionsoft, controller.requestAccessToken);

module.exports = router;
