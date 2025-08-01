const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')
const Review = require('../model/reviewModel');
const factory = require('./handlerFactory');

exports.setTourAndUserIds = (req,res,next) =>{
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
}
exports.getAllreviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review)
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
