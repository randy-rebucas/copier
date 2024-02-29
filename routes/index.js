var express = require('express');
var router = express.Router();

/**
 * loads middlewares
 */
const infusionsoft = require("../middlewares/localStorage");
const authorizationUrl = require("../middlewares/authorizationUrl");

const controller = require('../controllers/index');

/* GET home page. */
router.get('/', infusionsoft, authorizationUrl, controller.index);

module.exports = router;