const express = require('express')
const viewsController = require('../controllers/viewsController')
const router = express.Router()
const authController = require('../controllers/authController')



router.get('/',authController.isLoggedIn, viewsController.getOverview)

router.get('/tours/:slug', authController.isLoggedIn, viewsController.getTour)

router.get('/login',authController.isLoggedIn,  viewsController.getLoginForm)

router.get('/me', authController.protect, viewsController.getAccount)


module.exports=router;