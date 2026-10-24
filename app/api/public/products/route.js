import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import "@/models/User";

export const dynamic = "force-dynamic";
const PAGE = 8;

export async function GET(req) {
  try {
    const sp = new URL(req.url).searchParams;
    const category = sp.get("category");
    const q = sp.get("search")?.trim();
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const filter = {};
    if (category) filter.category = category;
    if (q) filter.name = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    await connectDB();
    const rows = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE)
      .limit(PAGE + 1)
      .populate("owner", "name")
      .lean();
    const hasMore = rows.length > PAGE;
    const products = rows.slice(0, PAGE).map(({ owner, ...p }) => ({ ...p, sellerName: owner?.name || "" }));
    return NextResponse.json({ products, hasMore });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ products: [], hasMore: false });
  }
}
