const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const CommentSchema = mongoose.Schema(
  {
    user: {
      id: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Please provide user Id"],
      },
      name: {
        type: String,
        required: [true, "Please Provide name"],
      },
    },
    postId: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
    comment: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

CommentSchema.plugin(autopopulate);

module.exports = mongoose.model("Comment", CommentSchema);
