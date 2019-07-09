const mongoose = require('mongoose');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

const TutorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: { unique: true },
        validate: {
            validator: emailValidator.validate,
            message: props => `${props.value} is not a valid email address!`,
        },
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
    },
    phoneNumber: {
        type: String, //should this be a number?
        required: true,
        index: { unique: true },
        length: 10
    },
    ratings: {
        type: Array
    },
    averageRating: {
        type: Number,
    },
    courses: {
        type: Array,
        required: true
    },
    timesAvail: {
        type: Array
    },
    currentlyWorking: {
        type: Boolean,
        required: true,
        default: false
    },
    avatar: {
        type: String,
    },
}, { timestamps: true });

TutorSchema.pre('save', async function preSave(next) {
    const tutor = this;
    if (!tutor.isModified('password')) return next();
    try {
        const hash = await bcrypt.hash(tutor.password, SALT_ROUNDS);
        tutor.password = hash;
        return next();
    } catch (err) {
        return next(err);
    }
});

TutorSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Tutors', TutorSchema);
