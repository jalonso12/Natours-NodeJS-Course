const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    password: {
        type: String,
        required: [true, "Passsword for your account must be provided"],
        minlength: [8, "Password is too short;  minimum of 8 characters"]
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
    photo: String
});

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;