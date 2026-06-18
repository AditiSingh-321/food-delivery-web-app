const { body } = require("express-validator");

const addReviewValidation = [
  body("restaurantId").trim().notEmpty().withMessage("Restaurant ID is required"),
  body("rating")
    .isNumeric()
    .custom((value) => value >= 1 && value <= 5)
    .withMessage("Rating must be between 1 and 5"),
  body("comment").trim().notEmpty().withMessage("Comment is required"),
];

module.exports = {
  addReviewValidation,
};
