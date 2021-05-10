/* eslint-disable arrow-body-style */
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const generateJwtToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  });

  const token = generateJwtToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password exist
  if (!email || !password) {
    return next(new AppError('provide email and password', 400));
  }

  // check if user exist and if password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or password', 401));
  }

  // if everything's ok, send token to client
  const token = generateJwtToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protectRoute = catchAsync(async (req, res, next) => {
  // 1) get token and check if it is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('log in to get access', 401));
  }
  // 2) verify token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // 3) check if user still exits
  const decodedUser = await User.findById(decodedToken.id);
  if (!decodedUser) {
    return next(new AppError('user no longer exits', 401));
  }

  // 4) check if user changed password after the jwt was issued
  if (decodedUser.changedPasswordAfterJwt(decodedToken.iat)) {
    return next(
      new AppError('password has been changed, please login again', 401)
    );
  }

  // grant access to protective route
  req.user = decodedUser;
  next();
});

exports.restrictRole = (...roles) => {
  return (req, res, next) => {
    // roles admin super-admin
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you do not have permission to access this resource', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user posted on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError(`user with this email does not exist`, 404));
  }

  // 2. Generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. send it to user email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? submit a request with your new password to ${resetUrl}.\n
  if you didn't request a password reset, please ignore this message`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token, only valid for 10 minutes',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: `token sent to email`,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'new App error, there was an error sending the email, try again later',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) Set password only if token has not expired and there is a user
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // 3) update the passwordChangedAt property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 4) log the user in, send jwt
  const token = generateJwtToken(user._id);
  res.status(200).json({
    message: 'success',
    token,
  });
});
