const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter your name"],
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please Enter your email"],
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter your password"],
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// JWT TOKEN
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
//Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  //Generating token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //Hashing and adding resetPassword Token to userSchema

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
