# Appliances — Next.js + MongoDB marketplace

Rollar: **Xaridor (user)** va **Sotuvchi (seller)** — ro'yxatdan o'tishda tanlanadi.

1. `.env.local` da `MONGO_URI` va `JWT_SECRET` bo'lishi kerak.
2. `npm i`
3. `npm run dev` → http://localhost:4000
4. Production: `npm run build` va `npm start`

Sotuvchi: `/seller` — mahsulotlar CRUD + kelgan buyurtmalarni boshqarish.
Xaridor: `/` katalog, `/cart` savat, `/orders` buyurtmalar tarixi.
