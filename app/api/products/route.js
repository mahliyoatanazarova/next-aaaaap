import { NextResponse } from "next/server";
import Product from "@/models/Product";
import { authorize } from "@/lib/guard";
import { parseProduct } from "@/lib/product";

const esc = (q) => q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(req) {
  try {
    const { res, user } = await authorize(req, "seller");
    if (res) return res;
    const q = new URL(req.url).searchParams.get("search")?.trim();
    const filter = { owner: user._id };
    if (q) filter.name = { $regex: esc(q), $options: "i" };
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ products });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Ma'lumotlarni olib bo'lmadi" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { res, user } = await authorize(req, "seller");
    if (res) return res;
    const { data, error } = parseProduct(await req.json());
    if (error) return NextResponse.json({ error }, { status: 400 });
    const product = await Product.create({ ...data, owner: user._id });
    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Mahsulot yaratilmadi" }, { status: 500 });
  }
}
