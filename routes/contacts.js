var express = require('express');
var router = express.Router();

const controller = require('../controllers/contacts');

/**
 * loads middlewares
 */
const infusionsoft = require("../middlewares/localStorage");

const guard = require("../middlewares/routeGuard");
/* GET home page. */
router.get('/', guard, infusionsoft, controller.index);

router.get('/all', guard, infusionsoft, controller.getAll);

router.get('/count', guard, infusionsoft, controller.getCount);

router.get('/:id', guard, controller.getOne);

module.exports = router;