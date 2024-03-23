var express = require('express');
var router = express.Router();

const controller = require('../controllers/rest');


const guard = require("../middlewares/routeGuard");
/* GET home page. */

router.get('/contacts', guard, controller.getContacts);

router.get('/user/profile', guard, controller.getUserProfile);

module.exports = router;