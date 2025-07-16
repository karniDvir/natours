const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator')
const User = require('./userModel');
const tourSchema = new mongoose.Schema({

    name : {
        type: String,
        required: true,
        unique: true,
        maxLength: [40,'A tour name must have less or equal to 40 characters'],
        minLength: [3,'A tour name must have more or equal to 40 characters'],
       // validate: [validator.isAlpha, "message must be characters"]

    },
    slug: {
        type: String
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    ratingAverage: {
        type: Number,
        default: 1,
        min: [1, 'A rating must be above 1'],
        max: [2, 'A rating must be below 5'],
        set: val=>Math.round(val * 10) / 10

    },
    ratingQuantity: {
        type: Number,
        default: 1
    },
    duration: {
        type: Number,
        //required: [true, "A tour must have duration"]
    },
    maxGroupSize: {
        type: Number,
       // required: [true, "A tour must have a group Size"]
    },
    difficulty: {
        type: String,
        required: [true, "A tour must have difficulty"],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: function(props) {
                return `Difficulty must be either easy, medium or hard — currently set to '${props.value}'`;
            }
        },
    },
    priceDiscount: {
        type :Number,
            validate :{
            //WILL WORK ONLY ON CREATE AND NOT ON UPDATE (USING THIS!!)

                validator: function(val) {
                return val < this.price;
                },
                message: 'Discount price({VALUE}) should be below regular price'}
    },
    summary:{
        type: String,
        trim: true,
        //required: [true, "Discount must have a summary  "]

    },
    description: {
        type: String,
        trim: true,
        //required: [true, "A tour must have Description  "]
    },
    startLocation: {
        // GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    //embedded document
    locations: [{
        //GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates : [Number],
        address: String,
        description: String,
        day: Number

    }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
    ],
    imageCover: {
        type: String,
        //required: [true, "A tour must have an image cover"]
    },
    images: [String],
    createdAd : {
        type: Date,
        default: Date.now()
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}

    });
tourSchema.virtual('durationWeeks').get(function (){
    return this.duration / 7;
})


tourSchema.index({price: 1, ratingAverage: -1});
tourSchema.index({slug: 1});
tourSchema.index({ startLocation: '2dsphere' });


//virtual populate
tourSchema.virtual("reviews", {
    //the name of the model
    ref: 'Review',
    //the name of the field that we want to connect on the model we said
    foreignField: 'tour',
    //the name of the field here on this model
    localField: '_id'
})

//DOCUMENT MIDDLEWARE runs before .save() and create()
tourSchema.pre('save', function (next){
    this.slug = slugify(this.name, {lower : true});
    next();
})

//QUERY MIDDLEWARE find() by using /^'find'/ we will do it for all string starts with find
tourSchema.pre(/^find/, function (next){
    this.find({secretTour : {$ne: true}})
    next();
});
tourSchema.pre(/^find/, function (next){
    this.populate({
        path: 'guides',
        select: '-__v  -passwordChangedAt'
    })
    next();
});

tourSchema.post('save', function (error, doc, next) {
    if (error.name === 'ValidationError') {
        error.message += ` ❌❌❌ tour name: ${this.name}`;
        //console.log(`❌ Validation failed for tour: ${this.name || '[unnamed tour]'}`);
    }
    next(error); // pass the error along
});
const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour;