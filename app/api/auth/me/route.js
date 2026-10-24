import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getSession } from "@/lib/auth";

export async function GET(req) {
  const session = getSession(req);
  if (!session) return NextResponse.json({ error: "Token yaroqsiz yoki muddati tugagan" }, { status: 401 });
  try {
    await connectDB();
    const user = await User.findById(session.id).select("name email role");
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 401 });
    return NextResponse.json({ user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    console.error("ME ERROR:", e);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
