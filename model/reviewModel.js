const mongoose = require('mongoose');
const Tour = require('../model/tourModel')

const reviewSchema = new mongoose.Schema({
  review : {
    type: String,
    required: true,
    maxLength: [40,'A review  must have less or equal to 40 characters'],
    minLength: [3,'A review  must have more or equal to 40 characters'],
  },
  rating: {
    type:Number,
    required: true,
    min: [1, 'A rating must be above 1'],
    max: [5, 'A rating must be below 5']
  },
  createdAt:{
    type: Date,
    default: Date.now
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Review must be belong to a tour']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must be belong to a user']
  }
},
  {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  })

//this will create an index thats will be unique, meaning this index can appear only ones
reviewSchema.index({tour: 1, user:1},{unique: true})

reviewSchema.pre(/^find/, function(next){
   this.populate({ path: 'user',
      select: 'name photo'})
  next();
})

reviewSchema.statics.calcAverageRating = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour', //gruop by
        nRating: {$sum: 1},
        avgRating: {$avg: '$rating'}

      }
    }
  ]);
  console.log(stats);
  if (stats.length > 0){
  await Tour.findByIdAndUpdate(tourId,{
    ratingQuantity:stats[0].nRating,
    ratingAverage: stats[0].avgRating
  })}
  else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingQuantity: 0,
      ratingAverage: 1
    })
  }
};
//on create

reviewSchema.post('save', function(){
  this.constructor.calcAverageRating(this.tour);
})

// on delete and update
// first create query and insert the tour into the document becuase we wont be able to access it
//with update and delete
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  console.log(this.r)
  next();
})
//use the tour we inserted
reviewSchema.post(/^findOneAnd/,  async function() {
  await this.r.constructor.calcAverageRating(this.r.tour);
})


const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;