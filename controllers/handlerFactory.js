const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { Model } = require('mongoose');
const APIFeatures = require('../utils/APIFeatures');
const Tour = require('../model/tourModel');

exports.deleteOne = Model=>
  catchAsync(async (req, res,next) => {
  const doc = await Model.findByIdAndDelete(req.params.id);
  if (!doc){
    return next(new AppError(`No document with ${req.params.id} found`, 404));
  }
  res.status(204).json({
    status: 'success',
    data: doc
  });
});

exports.createOne = Model=>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        tour: newDoc
      }
    })
  });


exports.updateOne = Model =>
  catchAsync(async (req, res,next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id,req.body,{
      new: true, //return the new document to tour
      runValidators: true //use the validators of the schema
    })
    if (!doc){
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc
      }
    })
  });


exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res,next) => {
    let query = Model.findById(req.params.id);
    //populate = {path, select..}
    if (popOptions) query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        data: doc
      }
    })
  });


exports.getAll = Model =>
  catchAsync(async (req, res,next) => {
  //to allow nested review on tour
    let filter = {}
    if (req.params.tourId) filter = {tour: req.params.tourId}
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paging();

    const doc = await features.query;
    res.status(200).json({
      status: "success",
      data: {
        data: doc
      }
    })
  });
