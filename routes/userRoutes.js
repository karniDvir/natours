const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.patch('/resetPassword/:token', authController.resetPassword);
router.post('/forgetPassword', authController.forgetPassword);

//protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateMe',
  userController.uploadUserPhoto,
  userController.resizePhoto,
  userController.updateMe)
router.patch(
  '/updateMyPassword/',
  authController.updatePassword);
router.get('/me',
  userController.getMe,
  userController.getUser)

//restricted to admin
router.use(authController.restrictedTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
