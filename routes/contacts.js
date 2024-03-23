var express = require('express');
var router = express.Router();

const controller = require('../controllers/contacts');

/**
 * loads middlewares
 */
const database = require("../middlewares/database");
const guard = require("../middlewares/routeGuard");

/* GET home page. */
router.get('/', database, guard, controller.index);

router.get('/all', database, guard, controller.getAll);

router.get('/:id', database, guard, controller.getOne);

module.exports = router;