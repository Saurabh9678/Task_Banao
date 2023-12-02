const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const Post = require("../Models/postModel");
const Comment = require("../Models/commentModel");
const { encryptText, decryptText } = require("../utils/encryption");

exports.createPost = catchAsyncError(async (req, res, next) => {
  const user = req.user;
  const { content } = req.body;

  if (!content) return next(new ErrorHandler("Content cannot be empty", 400));
  const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
  const cipherContent = encryptText(content, encryptionKey);
  const data = {
    user: {
      id: user._id,
      name: user.name,
    },
    content: {
      text: cipherContent.ciphertext,
      iv: cipherContent.iv,
    },
  };

  const post = await Post.create(data);
  if (!post) return next(new ErrorHandler("Server Error", 500));

  res.status(200).json({
    success: true,
    data: {
      post,
    },
    message: "Post Created",
    error: "",
  });
});

exports.getPosts = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const user = req.user;
  const totalPosts = await Post.countDocuments();

  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  const isMore = skip + posts.length < totalPosts;

  if (posts.length === 0) {
    res.status(200).json({
      success: true,
      data: "No available post",
    });
  }

  const decryptedPosts = posts.map((post) => {
    const decryptedContent = decryptText(
      post.content.text,
      Buffer.from(process.env.ENCRYPTION_KEY, "hex"),
      Buffer.from(post.content.iv, "hex")
    );
    return {
      ...post.toObject(),
      content: decryptedContent,
    };
  });

  let finalPost = decryptedPosts.map((post) => {
    const numberOfLikes = post.likes.length;
    const numberOfComments = post.comments.length;
    if (numberOfLikes !== 0) {
      const userIdIndex = post.likes.findIndex(
        (id) => id.toString() === user._id.toString()
      );
      if (userIdIndex !== -1) {
        return { ...post, numberOfLikes, isLiked: true, numberOfComments };
      } else {
        return { ...post, numberOfLikes, isLiked: false, numberOfComments };
      }
    } else {
      return { ...post, numberOfLikes, isLiked: false, numberOfComments };
    }
  });

  return res.status(200).json({
    success: true,
    data: { finalPost, isMore },
  });
});

exports.getPostById = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const user = req.user;
  const post = await Post.findById(id);

  if (!post) return next(new ErrorHandler("Post not found", 404));

  const numberOfLikes = post.likes.length;
  const numberOfComments = post.comments.length;
  let finalPost = {};

  const decryptedContent = decryptText(
    post.content.text,
    Buffer.from(process.env.ENCRYPTION_KEY, "hex"),
    Buffer.from(post.content.iv, "hex")
  );

  if (numberOfLikes !== 0) {
    const userIdIndex = post.likes.findIndex(
      (id) => id.toString() === user._id.toString()
    );
    if (userIdIndex !== -1) {
      finalPost = {
        ...post.toObject(),
        content: decryptedContent,
        numberOfLikes,
        isLiked: true,
        numberOfComments,
      };
    } else {
      finalPost = {
        ...post.toObject(),
        content: decryptedContent,
        numberOfLikes,
        isLiked: false,
        numberOfComments,
      };
    }
  } else {
    finalPost = {
      ...post.toObject(),
      content: decryptedContent,
      numberOfLikes,
      isLiked: false,
      numberOfComments,
    };
  }

  return res.status(200).json({
    success: true,
    data: finalPost,
  });
});

exports.editPost = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const { content } = req.body;

  const post = await Post.findById(id);

  if (!post) return next(new ErrorHandler("Post not found", 404));

  const encryptedContent = encryptText(
    content,
    Buffer.from(process.env.ENCRYPTION_KEY, "hex")
  );

  post.content.text = encryptedContent.ciphertext;
  post.content.iv = encryptedContent.iv;

  await post.save({ validateBeforeSave: false });

  return res.status(200).json({
    success: true,
    data: post.content.text,
  });
});

exports.deletePost = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const post = await Post.findById(id);
  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Post not found",
    });
  }
  if (post.comments.length > 0) {
    await Comment.deleteMany({ postId: id });
  }
  await post.deleteOne({ _id: id });
  return res.status(200).json({
    success: true,
    data: "Post deleted",
  });
});

exports.likePost = catchAsyncError(async (req, res, next) => {
  const id = req.params.id;
  const user = req.user;

  const post = await Post.findById(id);
  if (!post) {
    return next(new ErrorHandler("Post Not found", 404));
  }

  let message = "";

  const userIdIndex = post.likes.findIndex(
    (id) => id.toString() === user._id.toString()
  );

  if (userIdIndex === -1) {
    post.likes.push(user._id);
    message = "liked";
  } else {
    post.likes.splice(userIdIndex, 1);
    message = "unliked";
  }

  await post.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `Post is ${message}`,
  });
});
