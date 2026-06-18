const { body } = require("express-validator");

const createRestaurantValidation = [
  body("restaurantName")
    .trim()
    .notEmpty()
    .withMessage("Restaurant name is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("cuisine").isArray({ min: 1 }).withMessage("At least one cuisine is required"),
  body("address.street").trim().notEmpty().withMessage("Street is required"),
  body("address.city").trim().notEmpty().withMessage("City is required"),
  body("address.state").trim().notEmpty().withMessage("State is required"),
  body("address.zipCode").trim().notEmpty().withMessage("Zip code is required"),
  body("address.country").trim().notEmpty().withMessage("Country is required"),
];

const updateRestaurantValidation = [
  body("restaurantName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Restaurant name cannot be empty"),
  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty"),
  body("isOpen")
    .optional()
    .isBoolean()
    .withMessage("isOpen must be a boolean value"),
];

module.exports = {
  createRestaurantValidation,
  updateRestaurantValidation,
};
