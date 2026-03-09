import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  customer: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ["paid", "pending", "canceled"],
    required: true,
  },

  total: {
    type: Number,
    required: true,
  },

  itemsCount: {
    type: Number,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", orderSchema);
