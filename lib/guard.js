import { NextResponse } from "next/server";
import { connectDB } from "./mongodb";
import { getSession } from "./auth";
import User from "@/models/User";

// Tokenni tekshiradi, foydalanuvchi va uning rolini BAZADAN oladi.
// role berilsa — faqat shu rol ruxsat oladi.
export async function authorize(req, role) {
  const session = getSession(req);
  if (!session) return { res: NextResponse.json({ error: "Avval tizimga kiring" }, { status: 401 }) };
  await connectDB();
  const user = await User.findById(session.id).select("name email role");
  if (!user) return { res: NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 401 }) };
  if (role && user.role !== role)
    return { res: NextResponse.json({ error: "Bu amal uchun sizda ruxsat yo'q" }, { status: 403 }) };
  return { user };
}
