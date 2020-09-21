const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Don't forget to enter your name"],
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Don't forget to provide your email address"],
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email address"]
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, "Passsword for your account must be provided"],
        minlength: [8, "Password is too short;  minimum of 8 characters"],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "Confirm your password in order to continue"],
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: "Passwords does not match"
        }
    },
    passwordChangedAt: {
        type: Date,
        required: true,
        select: false
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    photo: String,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;

    next();
});

userSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });

    next();
});

userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.methods.correctPassword = async function(inputPassword, userPassword) {
    return await bcrypt.compare(inputPassword, userPassword);
};

userSchema.methods.changedPassword = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWTTimestamp < changedTimestamp;
    }
    
    return false;
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256')
                                    .update(resetToken)
                                    .digest('hex');

    console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 10 * 60 *1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;