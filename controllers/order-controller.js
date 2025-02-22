const orderModel = require("../models/order-model");
const UserModel = require("../models/user-model");

class OrderController {
  async addOrder(req, res, next) {
    try {
      const { clientInfo, items, totalPrice, totalItemsAmount, status } =
        req.body;

      // Find the user
      const userData = await UserModel.findOne({ email: req.user.email });

      if (userData) {
        // Create a new order
        const newOrder = await orderModel.create({
          user: userData._id,
          clientInfo,
          items,
          totalPrice,
          totalItemsAmount,
          status,
        });

        // Update user's orders
        userData.orders.push(newOrder._id);
        await userData.save();

        return res.json(newOrder);
      } else {
        return res.status(404).json({ message: "User not found." });
      }
    } catch (error) {
      next(error);
    }
  }

  async getOrdersByUser(req, res, next) {
    try {
      const userData = await UserModel.findOne({
        email: req.user.email,
      }).populate({
        path: "orders",
        populate: {
          path: "items.item",
        },
      });
      return res.json(userData.orders);
    } catch (error) {
      next(error);
    }
  }

  async getAllOrders(req, res, next) {
    try {
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
