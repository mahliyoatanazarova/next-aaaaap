import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { authorize } from "@/lib/guard";

const err = (error, status) => NextResponse.json({ error }, { status });

// Buyurtmalar ro'yxati: xaridor — o'zinikini, sotuvchi — o'ziga kelganlarini ko'radi
export async function GET(req) {
  try {
    const { res, user } = await authorize(req);
    if (res) return res;
    const filter = user.role === "seller" ? { seller: user._id } : { buyer: user._id };
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    return NextResponse.json({ orders });
  } catch (e) {
    console.error(e);
    return err("Buyurtmalarni olib bo'lmadi", 500);
  }
}

// Buyurtma berish (faqat xaridor)
export async function POST(req) {
  const restored = [];
  const rollback = () => Promise.all(restored.splice(0).map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty } })));
  try {
    const { res, user } = await authorize(req, "user");
    if (res) return res;

    const body = await req.json();
    const phone = String(body.phone || "").trim();
    const address = String(body.address || "").trim();
    if (!/^\+?[\d\s()-]{7,20}$/.test(phone)) return err("Telefon raqami noto'g'ri", 400);
    if (address.length < 5) return err("Manzilni to'liq kiriting", 400);
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 50) return err("Savat bo'sh", 400);

    // bir xil mahsulotlarni birlashtirish
    const qtyById = new Map();
    for (const it of body.items) {
      const q = Math.floor(Number(it.quantity));
      if (!mongoose.isValidObjectId(it.productId) || !(q >= 1 && q <= 99)) return err("Savat ma'lumotlari noto'g'ri", 400);
      qtyById.set(it.productId, (qtyById.get(it.productId) || 0) + q);
    }

    const products = await Product.find({ _id: { $in: [...qtyById.keys()] } }).populate("owner", "name");
    if (products.length !== qtyById.size) return err("Ba'zi mahsulotlar topilmadi (o'chirilgan bo'lishi mumkin)", 404);

    // Ombordan atomik ayirish — ikki kishi bir vaqtda oxirgi donani ola olmaydi
    for (const p of products) {
      const qty = qtyById.get(p._id.toString());
      const r = await Product.updateOne({ _id: p._id, stock: { $gte: qty } }, { $inc: { stock: -qty } });
      if (r.modifiedCount === 0) {
        await rollback();
        return err(`"${p.name}" omborda yetarli emas`, 409);
      }
      restored.push({ id: p._id, qty });
    }

    // Har bir sotuvchi uchun alohida buyurtma
    const bySeller = new Map();
    for (const p of products) {
      const key = p.owner._id.toString();
      if (!bySeller.has(key)) bySeller.set(key, { seller: p.owner, items: [] });
      bySeller.get(key).items.push({
        product: p._id,
        name: p.name,
        price: p.price,
        image: p.image,
        category: p.category,
        quantity: qtyById.get(p._id.toString()),
      });
    }

    const docs = [...bySeller.values()].map(({ seller, items }) => ({
      buyer: user._id,
      buyerName: user.name,
      buyerEmail: user.email,
      seller: seller._id,
      sellerName: seller.name,
      items,
      total: Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100,
      phone,
      address,
    }));

    let orders;
    try {
      orders = await Order.insertMany(docs);
    } catch (e) {
      await rollback();
      throw e;
    }
    return NextResponse.json({ orders }, { status: 201 });
  } catch (e) {
    console.error(e);
    await rollback().catch(() => {});
    return err("Buyurtma berib bo'lmadi", 500);
  }
}
