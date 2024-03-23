var express = require('express');
var router = express.Router();

/**
 * loads middlewares
 */
const database = require("../middlewares/database");
const authorizationUrl = require("../middlewares/authorizationUrl");

const controller = require('../controllers/index');

/* GET home page. */
router.get('/', database, authorizationUrl, controller.index);

module.exports = router;