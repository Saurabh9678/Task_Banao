const User = require("../Models/userModel");

const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncError");
const jwt = require("jsonwebtoken");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const headerToken = req.headers.authorization;
  let token;
  if (headerToken) {
    const splited_token = headerToken.split(" ");
    if (splited_token[0] === "Bearer") {
      token = splited_token[1]; // Get the token from the array
    } else {
      return next(new ErrorHandler("Please login to access the resource", 401));
    }
    if (!token) {
      return next(new ErrorHandler("Please login to access the resource", 401));
    }
  } else {
    return next(new ErrorHandler("Please login to access the resource", 401));
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);


    const user = await User.findById(decodedData.id);


    req.user = user;
    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    return next(new ErrorHandler("Authentication failed", 401));
  }
});
