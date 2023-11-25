const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../Models/userModel");
const bcrypt = require("bcryptjs");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");


// Register a User
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (name.includes(" ")) {
    return next(new ErrorHandler("Name cannot contain spaces", 400));
  }
  const userExist = await User.findOne({ email });
  if (userExist) {
    return next(
      new ErrorHandler("You are already registered, instead login", 401)
    );
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  sendToken(user, 201, res);
});

// Login User
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { name, password } = req.body;

  // checking if user has given password and email both

  if (!name || !password) {
    return next(new ErrorHandler("Please Enter Username & Password", 400));
  }

  const user = await User.findOne({ name }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid name or password", 401));
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid name or password", 401));
  }

  sendToken(user, 200, res);
});

// Forgot Password

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(new ErrorHandler("User Not Found", 404));

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/user/password/reset/${resetToken}`;

  const message = `Your reset password link is:\n\n ${resetPasswordUrl} \n\n if you have not requested this email then, please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Message sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

//Reset password

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  //Creating Token Hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user)
    return next(
      new ErrorHandler("Reset password token is invalid or has expired", 400)
    );

  if (req.body.password !== req.body.confirmPassword)
    return next(
      new ErrorHandler("Both the fields must have same password", 400)
    );

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save({ validateBeforeSave: false });

  sendToken(user, 200, res);
});


