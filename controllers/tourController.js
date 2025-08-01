const Tour = require('../model/tourModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp')


exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour,{path: 'reviews'})
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour);

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) =>{
  if (file.mimetype.startsWith('image')){
    cb(null,true);
  }
  else {
    cb(new AppError("Not an image, please upload an image", 400), false);
  }
}
exports.uploadTourPhotos = multer({
  storage: multerStorage,
  fileFilter: multerFilter })
  .fields([{name: 'imageCover', maxCount: 1},
                 {name: 'images', maxCount: 3}])

exports.resizeTourImages = catchAsync(async (req,res,next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-coverImage.jpeg`
  console.log(req.body.imageCover);
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg', { quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`)
  req.body.images = [];
  await Promise.all(req.files.images.map(async (file, i ) => {
      const filename = `tour-${req.params.id}-${Date.now()}-Image${i + 1}.jpeg`;
      await sharp(req.files.images[i].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg', { quality: 90 })
        .toFile(`public/img/tours/${filename}`)
      req.body.images.push(filename)
    }));
  next();
})


exports.aliasTopTours = (req,res,next) =>{
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage,summery,difficulty';
  next();
}

exports.getToursStats = catchAsync(async (req,res,next) => {
  const stats = await Tour.aggregate([
    {
      $match: {ratingAverage : {$gte: 1}}
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: {$sum: 1},
        avgRating: {$avg: '$ratingAverage'},
        avgPrice: {$avg: '$price'},
        minPrice: {$min: '$price'},
        maxPrice :{$max: '$price'}
      },
      $sort: {avgPrice: 1}
    }
  ])
  res.status(200).json({
    status: "success",
    data: {
      stats
    }
  })
});

exports.getMonthlyPlan = catchAsync(async (req,res,next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind :'$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: {$month: '$startDates'},
        numTourStart: {$sum: 1},
        tours: {$push: '$name'}
      }
    },
    {
      $addFields: {month: '$_id'}
    },
    {
      $project:{
        _id: 0
      }
    },
    {
      $sort : {numTourStart: -1}
    },
    {
      $limit: 12
    }

  ])
  res.status(200).json({
    status: "success",
    data: {
      plan
    }
  })
});
//'/tours-within/:distance/center/:latlng/unit/:unit'
exports.getToursWithin = catchAsync(async (req,res,next) =>{
  const {distance,latlng,unit} = req.params;
  const [lat,lng] = latlng.split(',');
  if (!lat ||!lng){
    return next(new AppError("Please provid in formatt ours-within/:distance/center/:latlng/unit/:unit",400))
  }
  console.log(distance,latlng,unit);
  const radius = unit === 'ml'? distance/3963.2 : distance/6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });
  console.log(tours);
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
})

exports.getDistances =  catchAsync(async (req,res,next) =>{
  const {latlng,unit} = req.params;
  const [lat,lng] = latlng.split(',');
  if (!lat ||!lng){
    return next(new AppError("Please provid in format ours-within/:distance/center/:latlng/unit/:unit",400))
  }
  const multiplyer = unit === 'ml' ? 0.000621371 : 0.001
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng*1, lat*1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplyer
      }
    },
    {
      $project: {
        distance: 1,
        name:1
      }
    }
  ])
  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances
    }
  });
})