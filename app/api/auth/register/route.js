import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const { name, email, password, role } = await req.json();
    if (!name?.trim() || !email?.trim() || !password)
      return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
    if (!/^\S+@\S+\.\S+$/.test(email))
      return NextResponse.json({ error: "Email noto'g'ri formatda" }, { status: 400 });
    if (password.length < 6)
      return NextResponse.json({ error: "Parol kamida 6 ta belgidan iborat bo'lsin" }, { status: 400 });

    await connectDB();
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return NextResponse.json({ error: "Bu email allaqachon ro'yxatdan o'tgan" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: role === "seller" ? "seller" : "user" });
    const payload = { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
    return NextResponse.json({ token: signToken(payload), user: payload }, { status: 201 });
  } catch (e) {
    console.error("REGISTER ERROR:", e);
    return NextResponse.json({ error: "Server xatosi. MONGO_URI va JWT_SECRET ni tekshiring" }, { status: 500 });
  }
}
