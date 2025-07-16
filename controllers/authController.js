const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');
const { promisify } = require('util')
const  Email = require('../utils/email');
const crypto = require('crypto')

const createAndSentToken = (user, statusCode,res) => {
  const token = signToken(user._id);
  const cookieOption = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 *1000),
      httpOnly:true //cannot be changed by browser
  }
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('jwt',token ,cookieOption)
  //to not the password to anyone
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user
    }
  });
}


const signToken = id=>{
  return jwt.sign({id}, process.env.JWT_SECRET,{
    expiresIn: process.env.JWT_EXPIRE_IN
  });
}

exports.signUp = catchAsync(async (req, res, next)=>{
  const newUser = await User.create({
    //specify
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url)
  await new Email(newUser,url).sendWelcome();
  createAndSentToken(newUser,201,res);
});

exports.login = catchAsync(async (req,res,next) => {
  const {email,password} = req.body;
  console.log(email,password);
  //1) check if email, password exist
  if(!email || !password){
    return next(new AppError("Please provide email and password", 400))
  }
  //2)check if user exist and password is correct
  const user = await User.findOne({email}).select('+password');
  //fist check if user exist then check if the password is correct
  if (!user ||!await user.correctPassword(password,user.password)){
    return next(new AppError("incorrect email or password", 401));
  }
  //3)if everything okay, send token back to client
  createAndSentToken(user,200,res);
});

exports.protect = catchAsync(async (req,res,next) =>{
  //1) get token and check if its exist
  let token;
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token){
    if (req.cookies.jwt){
      token = req.cookies.jwt
    }
    else
      return next(new AppError("Please login to access this recurse",401));
  }
  //2)validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded)
  //3)check if user still exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser){
    return next(new AppError("the user is no longer exist",401))
  }
  //4)check if user changed password if token was issued
  if (await freshUser.changedPasswordAfter(decoded.iat)){
    return next(new AppError("Recently the password changed, please login again",401))
  }
  req.user = freshUser;
  //req.locals.user = freshUser;
  next();
});

exports.logout = (req,res,next) =>{
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 *1000),
    httpOnly: true
  });
  res.status(200).json({
    status: "success"
  })
}

exports.restrictedTo = (...roles) =>{
  return (req, res,next) =>{
    if (!roles.includes(req.user.role)){
      return next(new AppError("You do not hav permission for this section", 403))
    }
    next()
  }
}

exports.forgetPassword = catchAsync(async (req,res,next) => {
  //1)get user based on ost request email
  const user = await User.findOne({email: req.body.email})
  if (!user){
    return next(new AppError("not found user with that email",404));
  }
  //2)generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({validateBeforeSave: false});
  //3)send the token with email
  const resertURL =`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message =   `Send patch request with the new password and the password confirm to ${resertURL}`;
  // if the there is an error sending the email then we need to make sure no one can use the token
  // try{
  //   await sendEmail({
  //     email: req.body.email,
  //     subject: "reset token vaild for 10 min",
  //     message
  //   })
  //   res.status(200).json({
  //     status: "success",
  //     message: "token sent to email"
  //   })
  // }
  // catch (err){
  //   console.log(err)
  //   user.passwordResetToken = undefined;
  //   user.passwordResetExpires = undefined;
  //   await user.save({validateBeforeSave: false});
  //   return next(new AppError("could`t send email", 500))
  // }
})

exports.resetPassword = catchAsync(async (req,res,next) => {
//1)get user based on token
  const hashedToken =  crypto
    .createHash("sha256").
    update(req.params.token).
    digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {$gt : Date.now()}
  });
// 2) if token not expierd, there is a user so reset password
  if (!user){
    return next(new AppError("Token is invalid or has expired"), 400)
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;//
  await user.save()
  // 3) update changedPasswordAt for the user
// 4) login the user
  createAndSentToken(user,200,res);
});

exports.updatePassword = catchAsync(async (req,res,next) =>{
  //1) get user from collection
  const user = await User.findById(req.user.id).select('+password');
  //2) check if password id correct
  if (!await user.correctPassword(req.body.passwordCurrent, user.password)){
    console.log("password dont match")
    return next(new AppError("password is wrong"), 400)
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //3)log user in send jwt
  createAndSentToken(user,200,res);

})

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const token = req.cookies.jwt;
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

      const currentUser = await User.findById(decoded.id);
      if (!currentUser) return next();

      if (await currentUser.changedPasswordAfter(decoded.iat)) return next();

      res.locals.user = currentUser;
    } catch (err) {
      return next(); // if token invalid/expired/etc
    }
  }
  return next();
});


