import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { authorize } from "@/lib/guard";

const err = (error, status) => NextResponse.json({ error }, { status });

// Sotuvchi o'tishlari: kutilmoqda → tasdiqlandi/bekor, tasdiqlandi → yetkazildi/bekor
const SELLER_FLOW = { pending: ["confirmed", "cancelled"], confirmed: ["delivered", "cancelled"] };

export async function PATCH(req, { params }) {
  try {
    const { res, user } = await authorize(req);
    if (res) return res;
    if (!mongoose.isValidObjectId(params.id)) return err("ID noto'g'ri", 400);
    const { status } = await req.json();

    const order = await Order.findById(params.id);
    if (!order) return err("Buyurtma topilmadi", 404);

    if (user.role === "seller") {
      if (order.seller.toString() !== user._id.toString()) return err("Bu buyurtma sizniki emas", 403);
      if (!SELLER_FLOW[order.status]?.includes(status)) return err("Holatni bunday o'zgartirib bo'lmaydi", 400);
    } else {
      if (order.buyer.toString() !== user._id.toString()) return err("Bu buyurtma sizniki emas", 403);
      if (status !== "cancelled" || order.status !== "pending")
        return err("Faqat kutilayotgan buyurtmani bekor qilish mumkin", 400);
    }

    // Bekor qilinsa — mahsulotlar omborga qaytadi (faqat bitta marta)
    if (status === "cancelled") {
      const claimed = await Order.updateOne({ _id: order._id, status: { $ne: "cancelled" } }, { status: "cancelled" });
      if (claimed.modifiedCount === 1) {
        await Promise.all(order.items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } })));
      }
    } else {
      order.status = status;
      await order.save();
    }
    const fresh = await Order.findById(order._id).lean();
    return NextResponse.json({ order: fresh });
  } catch (e) {
    console.error(e);
    return err("Holatni yangilab bo'lmadi", 500);
  }
}
