const express = require('express');
const homePageController = require('../controllers/homePage');
const router = express.Router();

router.get('/home',homePageController.getHomePage);
// router.get('',homePageController.getErrorPage);

module.exports = router;

