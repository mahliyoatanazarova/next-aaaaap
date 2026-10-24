import dns from "node:dns";
import mongoose from "mongoose";

// Windows'da Node'ning standart DNS'i "mongodb+srv" SRV yozuvini topa olmaydi (querySrv ECONNREFUSED),
// shuning uchun ochiq DNS serverlaridan foydalanamiz
if (process.env.MONGO_URI?.startsWith("mongodb+srv://")) {
  const servers = ["8.8.8.8", "1.1.1.1", ...dns.getServers()];
  dns.setServers(servers);
  dns.promises.setServers(servers);
}

const cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI .env.local faylida topilmadi");
  if (cached.conn) return cached.conn;
  if (!cached.promise) cached.promise = mongoose.connect(uri, { bufferCommands: false });
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}
