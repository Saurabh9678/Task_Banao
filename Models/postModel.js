const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const PostSchema = new mongoose.Schema(
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
    content: {
      text: {
        type: String,
        required: [true, "Provide content of your post"],
      },
      iv: {
        type: String,
        required: true,
      },
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Comment",
        autopopulate: true,
      },
    ],
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

PostSchema.plugin(autopopulate);

module.exports = mongoose.model("Post", PostSchema);
