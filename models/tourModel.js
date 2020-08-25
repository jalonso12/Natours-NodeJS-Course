const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tour name missing'],
        unique: true,
        trim: true,
        maxlength: [40, 'Tour name too long, limit to 40 characters'],
        minlength: [10, 'Tour name too short, more than 10 characters required'],
        //validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'Must add duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Must specify group size']
    },
    difficulty: {
        type: String,
        requires: [true, "Must sepcify difficulty"],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Minimun rating is 1.0'],
        max: [5, 'Maximum rating is 5.0']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Must specify the price!!!']
    },
    priceDiscount: {
        type: Number,
        validate: {
            // Will only work on create!!!
            // check "validator" library on node js
            validator: function(val) {
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'Must add summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'Must supply cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

// DOCUMENT MIDDLEWARE
// .save() & .create()
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// REFERENCE PRE & POST MIDDLEWARES
// tourSchema.pre('save', function(next) {
//     console.log('Will save document...');
//     next();
// });

// tourSchema.post('save', function(doc, next) {
//     console.log(doc);
//     next();
// });


// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });

    this.start = Date.now();
    next();
});

// REFERENCE POST MIDDLEWARE
// tourSchema.post(/^find/, function(docs, next) {
//     console.log(`Query took ${Date.now() - this.start} milliseconds`)
//     next();
// });

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
    this.pipeline()
        .unshift({
            $match: {
                secretTour: {
                    $ne: true 
                } 
            } 
        });
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
