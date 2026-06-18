const { body } = require("express-validator");

const createOrderValidation = [
  body("restaurantId").trim().notEmpty().withMessage("Restaurant ID is required"),
  body("deliveryAddress").isObject().withMessage("Delivery address is required"),
  body("deliveryAddress.street").trim().notEmpty(),
  body("deliveryAddress.city").trim().notEmpty(),
  body("deliveryAddress.state").trim().notEmpty(),
  body("deliveryAddress.zipCode").trim().notEmpty(),
  body("deliveryAddress.country").trim().notEmpty(),
  body("paymentMethod")
    .isIn(["CASH_ON_DELIVERY", "ONLINE"])
    .withMessage("Invalid payment method"),
];

const updateOrderStatusValidation = [
  body("orderStatus")
    .isIn([
      "PLACED",
      "CONFIRMED",
      "PREPARING",
      "READY_FOR_PICKUP",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ])
    .withMessage("Invalid order status"),
];

module.exports = {
  createOrderValidation,
  updateOrderStatusValidation,
};
