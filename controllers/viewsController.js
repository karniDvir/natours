const Tour  = require('../model/tourModel');
const catchAsync  = require('../utils/catchAsync')
const Review = require('../model/reviewModel');
exports.getOverview = catchAsync(async (req , res, next)=>{
  //1) get tour data from collection
  const tours = await Tour.find();
  //2)build template

  //3)fill template
  res.status(200).render('overview',{
    title: ' All tours',
    tours
  })
})

exports.getTour = catchAsync(async (req, res,next)=>{
  const tour = await Tour.findOne(
    {slug :req.params.slug}).populate({
    path: 'reviews',
    fields: 'review rating user'
  });
  res.status(200).render('tour',{
    title: tour.name,
    tour
  })
})

exports.getLoginForm  = catchAsync(async (req, res, next)=>{

  res.status(200).render('login',{
    title: 'Log into your account'
  })
})

exports.getAccount = catchAsync(async (req, res) => {

  console.log(req.user)
  res.status(200).render('account', {
    title: 'Your account',
    user: req.user
  })
})