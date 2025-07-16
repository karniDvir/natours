const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/APIFeatures');
const User = require('../model/userModel');
const AppError = require('../utils/AppError')
const factory = require('./handlerFactory');
const multer = require('multer')
const sharp = require('sharp')

//================= photo =====================
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) =>{
  if (file.mimetype.startsWith('image')){
    cb(null,true);
  }
  else {
    cb(new AppError("Not an image, please upload an image", 400), false);
  }
}
exports.uploadUserPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter
}).single('photo')

exports.resizePhoto = catchAsync(async (req,res,next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg', { quality: 70 })
    .toFile(`public/img/users/${req.file.filename}`)

  next();
})
//=================  =====================


const filterObj = (obj, ...allowedFileds) =>{
  const newObj = {};
  Object.keys(obj).forEach(el=> {
    if (allowedFileds.includes(el)) newObj[el] = obj[el];
  })
  return newObj;
}
exports.getAllUsers = factory.getAll(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Please user /signUp instead'
  });
};

exports.getMe = (req,res,next) => {
  req.params.id = req.user.id;
  next();
}

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
//do not update password
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)

exports.updateMe = catchAsync(async (req,res,next) => {
  //1) create error if user POST password data
  if (req.body.password || req.body.passwordConfirm){
    return next(new AppError("this route is not to update password", 400));
  }
  //2) Update user document
  const filterBody = filterObj(req.body, 'email','name');
  if (req.file) filterBody.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody,{
    new: true,
    runValidators: true})
  res.status(200).json({
    status: "success",
    user: updatedUser
  })
})

exports.deleteMe = catchAsync(async(req,res,next) =>{
  await User.findByIdAndDelete(req.user.id, {active: false})
  res.status(204).json({
    status: "success"
  })
})