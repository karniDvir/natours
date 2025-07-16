const express = require('express');
const reviewController = require('../controllers/reviewController')
const authController = require('../controllers/authController')

//use mergeParams to access Params from other routers
const router = express.Router({mergeParams:true});

router.use(authController.protect);
// GET all reviews
router.route('/')
  .get(reviewController.getAllreviews)
  .post(authController.restrictedTo('user','admin'),
    reviewController.setTourAndUserIds,
    reviewController.createReview);

// GET/UPDATE/DELETE by review ID
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(authController.restrictedTo('user','admin'),
    reviewController.deleteReview
  );


module.exports = router;

