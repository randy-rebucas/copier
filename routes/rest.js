var express = require('express');
var router = express.Router();

const controller = require('../controllers/rest');

/**
 * loads middlewares
 */
const infusionsoft = require("../middlewares/sessionStorage");

const guard = require("../middlewares/routeGuard");
/* GET home page. */

router.get('/contacts', guard, infusionsoft, controller.getContacts);

router.get('/user/profile', guard, infusionsoft, controller.getUserProfile);

module.exports = router;