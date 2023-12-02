const router = require("express").Router();
const { isAuthenticatedUser } = require("../middleware/auth");
const {
  createPost,
  getPosts,
  deletePost,
  editPost,
  getPostById,
  likePost,
} = require("../Controller/PostController");

router
  .route("/")
  .post(isAuthenticatedUser, createPost)
  .get(isAuthenticatedUser, getPosts);

router
  .route("/:id")
  .get(isAuthenticatedUser, getPostById)
  .put(isAuthenticatedUser, editPost)
  .delete(isAuthenticatedUser, deletePost);

router.route("/like/:id").get(isAuthenticatedUser, likePost);

module.exports = router;
