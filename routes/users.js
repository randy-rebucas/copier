var express = require('express');
var router = express.Router();

const controller = require('../controllers/users');

/* GET home page. */
router.get('/', controller.index);

router.get('/profile', controller.profile);

module.exports = router;