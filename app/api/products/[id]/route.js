import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Product from "@/models/Product";
import { authorize } from "@/lib/guard";
import { parseProduct } from "@/lib/product";

export async function PUT(req, { params }) {
  try {
    const { res, user } = await authorize(req, "seller");
    if (res) return res;
    if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "ID noto'g'ri" }, { status: 400 });
    const { data, error } = parseProduct(await req.json());
    if (error) return NextResponse.json({ error }, { status: 400 });
    const product = await Product.findOneAndUpdate({ _id: params.id, owner: user._id }, data, { new: true });
    if (!product) return NextResponse.json({ error: "Mahsulot topilmadi" }, { status: 404 });
    return NextResponse.json({ product });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Yangilab bo'lmadi" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { res, user } = await authorize(req, "seller");
    if (res) return res;
    if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ error: "ID noto'g'ri" }, { status: 400 });
    const product = await Product.findOneAndDelete({ _id: params.id, owner: user._id });
    if (!product) return NextResponse.json({ error: "Mahsulot topilmadi" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "O'chirib bo'lmadi" }, { status: 500 });
  }
}
