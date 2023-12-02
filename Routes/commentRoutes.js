const router = require("express").Router();
const { isAuthenticatedUser } = require("../middleware/auth");
const {
  commentOnPost,
  deleteComment,
  editComment,
} = require("../Controller/CommentController");

router.route("/").post(isAuthenticatedUser, commentOnPost);

router
  .route("/:id")
  .put(isAuthenticatedUser, editComment)
  .delete(isAuthenticatedUser, deleteComment);

module.exports = router;
