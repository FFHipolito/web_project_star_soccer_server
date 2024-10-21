const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const {
  getUsers,
  getUserById,
  getUserInfo,
  updateUserProfile,
} = require("../controllers/users");

router.get("/", getUsers);
router.get("/me", getUserInfo);
router.get(
  "/:userId",
  celebrate({
    params: Joi.object().keys({
      userId: Joi.string().alphanum().length(24),
    }),
  }),
  getUserById
);
router.patch(
  "/me",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).optional(),
    }),
  }),
  updateUserProfile
);

module.exports = router;
