const { Schema, model, mongoose } = require("mongoose");

const OrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  orderNumber: { type: Number },
  clientInfo: { type: Schema.Types.Mixed },
  date: { type: Date, required: true, default: Date.now },
  items: [
    {
      item: { type: Schema.Types.ObjectId, ref: "Product" },
      amount: { type: Number },
      configuration: { type: Schema.Types.Mixed },
    },
  ],
  totalPrice: { type: Number, required: true },
  totalItemsAmount: { type: Number, required: true },
  status: { type: Number, required: true },
});

OrderSchema.pre("save", async function (next) {
  // Check if orderNumber already exists, if not, generate one
  if (!this.orderNumber) {
    try {
      // Get the current count of documents
      const count = await this.constructor.countDocuments();

      // Set the orderNumber to the count + 1
      this.orderNumber = count + 1;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = model("Order", OrderSchema);
