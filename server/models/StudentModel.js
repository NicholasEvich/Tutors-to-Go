const mongoose = require('mongoose');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

const StudentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true, //I'll have to deal with errors for this
        trim: true,
        lowercase: true,
        index: { unique: true }, //I'll have to deal with errors for this
        validate: {
        validator: emailValidator.validate, //I'll have to deal with errors for this
        message: props => `${props.value} is not a valid email address!`,
        },
    },
    password: {
        type: String,
        required: true, //I'll have to deal with errors for this
        trim: true,
        minlength: 8, //I'll have to deal with errors for this
    },
    phoneNumber: {
        type: String,
        required: true, //I'll have to deal with errors for this
        index: { unique: true }, //I'll have to deal with errors for this
        length: 10 //I'll have to deal with errors for this
    }
}, { timestamps: true });

StudentSchema.pre('save', async function preSave(next) {
    const student = this;
    if (!student.isModified('password')) return next();
    try {
        const hash = await bcrypt.hash(student.password, SALT_ROUNDS);
        student.password = hash;
        return next();
    } catch (err) {
        return next(err);
    }
});

/* Im having issues with this one, worry about it later
StudentSchema.pre('updateOne', async function preSave(next) {
    const student = this;
    if (!student.isModified('password')) return next();
    try {
        const hash = await bcrypt.hash(student.password, SALT_ROUNDS);
        student.password = hash;
        return next();
    } catch (err) {
        return next(err);
    }
});
*/

StudentSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('students', StudentSchema);
