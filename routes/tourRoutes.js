const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewsRoutes');

const router = express.Router();

//nested routes, use the review router for this url
router.use('/:tourId/reviews',reviewRouter)
router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/stats').get(tourController.getToursStats);
router.route('/monthly-plan/:year').get(authController.protect
  ,authController.restrictedTo('admin','lead-guide','guide'),
  tourController.getMonthlyPlan);

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit')
  .get(tourController.getDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect,
    authController.restrictedTo('admin', 'lead-guide'),
    tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect
    ,authController.restrictedTo('admin','lead-guide'),
    tourController.uploadTourPhotos,
    tourController.resizeTourImages,
    tourController.updateTour)
  .delete(authController.protect
    ,authController.restrictedTo('admin','lead-guide'),
    tourController.deleteTour);

module.exports = router;
