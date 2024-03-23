var express = require('express');
var router = express.Router();

/**
 * loads middlewares
 */
const database = require("../middlewares/database");

const controller = require('../controllers/setup');

/* GET home page. */
router.get('/', database, controller.index);

module.exports = router;