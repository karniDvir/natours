const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Must insert a name'],
    maxLength: [40,'A tour name must have less or equal to 40 characters'],
    minLength: [3,'A tour name must have more or equal to 40 characters'],
  },
  email: {
    type: String,
    required: [true, 'Must insert a name'],
    unique: [true, 'email already registered'],
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide valid email "]
},
  photo: {
    type: String,
    default:'default.jpg'
  },
  password: {
    type: String,
    required: true,
    minLength: [8,'password must have at least 8 characters'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      //this will only work on CREATE AND SAVE! remember using this can use save to update
      validator: function(el) {
        return el === this.password;
      },
      message: "passwords are not the same"
    }
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now()
  },
  role: {
    type: String,
    enum: ['user','guide','lead-guide', 'admin'],
    default: 'user'
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false

  }

});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew){ return next()}
  this.passwordChangedAt = Date.now() - 1000;
  next();
})

userSchema.pre('save', async function(next){
  //only run this function if the password was modify
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);

  //this will make the password be saved once
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre(/^'find'/, function(next) {
  this.find({active: {$ne : false} });
})

//instance methode from the document means this = this document. cant use here this.Password
//because Password is not select in schema
userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
  return await bcrypt.compare(candidatePassword,userPassword);
}

userSchema.methods.changedPasswordAfter = async function(JWTTimeStamp){
  if (this.passwordChangedAt){
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,10)
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
}

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User= mongoose.model('User',userSchema);

module.exports = User;
