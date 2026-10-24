import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    price: Number,
    image: String,
    category: String,
    quantity: { type: Number, min: 1, required: true },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    buyerName: String,
    buyerEmail: String,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerName: String,
    items: { type: [ItemSchema], required: true },
    total: { type: Number, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, enum: ["pending", "confirmed", "delivered", "cancelled"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
