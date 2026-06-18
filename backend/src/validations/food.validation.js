const { body } = require("express-validator");

const createFoodValidation = [
  body("name").trim().notEmpty().withMessage("Food name is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price").isNumeric().withMessage("Price must be a number"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("restaurant").trim().notEmpty().withMessage("Restaurant ID is required"),
];

const updateFoodValidation = [
  body("name").optional().trim().notEmpty(),
  body("description").optional().trim().notEmpty(),
  body("price").optional().isNumeric(),
  body("isAvailable").optional().isBoolean(),
];

module.exports = {
  createFoodValidation,
  updateFoodValidation,
};
