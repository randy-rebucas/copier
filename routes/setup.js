var express = require('express');
var router = express.Router();

/**
 * loads middlewares
 */
const infusionsoft = require("../middlewares/localStorage");

const controller = require('../controllers/setup');

/* GET home page. */
router.get('/', infusionsoft, controller.index);

router.post('/', controller.set);

module.exports = router;