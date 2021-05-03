const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'user must have a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: [true, `user with ${this.email} already exits`],
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minLength: [6, 'Password length cannot be less than 6 characters'],
    maxLength: [35, 'Password length cannot be more than 35 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'confirm your password please'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
    },
    message: 'passwords do not match',
  },
  passwordChangedAt: {
    type: Date,
    select: true,
  },
  photo: String,
});

// pre-save document middleware to encrypt passwords
userSchema.pre('save', async function (next) {
  // run function only if password was modified
  if (!this.isModified('password')) return next;

  this.password = await bcrypt.hash(this.password, 12);

  // Delete password confirm field
  this.passwordConfirm = undefined;
  next();
});

// instance method is a method that is available on all documents of a collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfterJwt = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return jwtTimestamp < changedTimeStamp;
  }

  //
  return false;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
