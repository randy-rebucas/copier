var express = require("express");
var router = express.Router();

const controller = require("../controllers/dashboard");

/**
 * loads middlewares
 */
const infusionsoft = require("../middlewares/localStorage");
const guard = require("../middlewares/routeGuard");

/* GET home page. */
router.get("/", guard, infusionsoft, controller.index);

module.exports = router;
