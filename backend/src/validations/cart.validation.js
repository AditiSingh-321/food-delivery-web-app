const { body } = require("express-validator");

const addToCartValidation = [
  body("foodId").trim().notEmpty().withMessage("Food ID is required"),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
];

const updateCartValidation = [
  body("quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
];

module.exports = {
  addToCartValidation,
  updateCartValidation,
};
