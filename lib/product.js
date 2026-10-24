const CATS = ["computers", "appliances", "smartphones"];

export function parseProduct(b) {
  const name = String(b.name || "").trim();
  const price = Number(b.price);
  const stock = Number(b.stock ?? 0);
  if (!name) return { error: "Mahsulot nomini kiriting" };
  if (!Number.isFinite(price) || price < 0) return { error: "Narx noto'g'ri" };
  if (!Number.isFinite(stock) || stock < 0) return { error: "Ombordagi soni noto'g'ri" };
  const image = String(b.image || "").trim();
  if (image && !/^https?:\/\//i.test(image)) return { error: "Rasm havolasi http:// yoki https:// bilan boshlansin" };
  if (!CATS.includes(b.category)) return { error: "Kategoriyani tanlang" };
  return {
    data: {
      name,
      price,
      stock: Math.floor(stock),
      category: b.category,
      description: String(b.description || "").trim(),
      image: String(b.image || "").trim(),
    },
  };
}

