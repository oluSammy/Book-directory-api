const crypto = require('crypto');
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
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    enum: ['user', 'admin', 'super-admin'],
    default: 'user',
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

// pre-save document middleware to set passwordChangedAt property when user change password
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 2000;
  next();
});

// instance method is a method that is available on all documents of a collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// method to verify if jwt was issued after password was changed
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

// instance method to generate random token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
