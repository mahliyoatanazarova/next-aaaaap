import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email?.trim() || !password)
      return NextResponse.json({ error: "Email va parolni kiriting" }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return NextResponse.json({ error: "Email yoki parol noto'g'ri" }, { status: 401 });

    const payload = { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
    return NextResponse.json({ token: signToken(payload), user: payload });
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    return NextResponse.json({ error: "Server xatosi. MONGO_URI va JWT_SECRET ni tekshiring" }, { status: 500 });
  }
}
