var express = require('express');
var router = express.Router();

const database = require("../middlewares/database");

const controller = require('../controllers/scrap');

/* GET home page. */
router.get('/', database, controller.index);

module.exports = router;