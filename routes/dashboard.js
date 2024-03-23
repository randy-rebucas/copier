var express = require("express");
var router = express.Router();

const controller = require("../controllers/dashboard");

/**
 * loads middlewares
 */
const database = require("../middlewares/database");
const guard = require("../middlewares/routeGuard");

/* GET home page. */
router.get("/", database, guard, controller.index);

module.exports = router;
