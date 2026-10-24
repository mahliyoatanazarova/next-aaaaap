"use client";
import ProductImage from "@/components/product-image";
import { useEffect, useRef, useState } from "react";
import { Search, PackageOpen, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { Input } from "@/components/ui/input";
import { CATEGORIES, cn, formatPrice } from "@/lib/utils";

export default function Showcase() {
  const [active, setActive] = useState("computers");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { user } = useAuth();
  const { items, add } = useCart();
  const isSeller = user?.role === "seller";
  const current = CATEGORIES.find((c) => c.value === active);

  // Joriy so'rov — eski (kechikkan) javoblar yangisini bosib ketmasligi uchun
  const queryRef = useRef("");
  queryRef.current = `${active}|${search}`;

  useEffect(() => {
    let cancelled = false;
    setPage(1);
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/public/products?category=${active}&search=${encodeURIComponent(search)}`);
        const d = await r.json();
        if (cancelled) return;
        setProducts(d.products || []);
        setHasMore(!!d.hasMore);
      } catch {
        if (cancelled) return;
        setProducts([]);
        setHasMore(false);
      }
      setLoading(false);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [active, search]);

  async function loadMore() {
    const query = queryRef.current;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const r = await fetch(`/api/public/products?category=${active}&search=${encodeURIComponent(search)}&page=${next}`);
      const d = await r.json();
      if (query !== queryRef.current) return;
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p._id));
        return [...prev, ...(d.products || []).filter((p) => !seen.has(p._id))];
      });
      setHasMore(!!d.hasMore);
      setPage(next);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  }

  function addToCart(p) {
    add(p);
    toast.success(`"${p.name}" savatga qo'shildi`);
  }

  return (
    <section id="catalog" className="container scroll-mt-20 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Kategoriya bo'yicha tanlang</h2>
        <p className="mt-3 text-muted-foreground">Kerakli bo'limni oching va yangi qo'shilgan mahsulotlarni ko'ring.</p>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="inline-flex max-w-full overflow-x-auto rounded-xl bg-muted p-1" role="tablist">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              role="tab"
              aria-selected={active === c.value}
              onClick={() => setActive(c.value)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:px-6",
                active === c.value ? "bg-foreground text-background shadow" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder={`${current.label} ichidan qidirish...`} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="mx-auto mt-10 overflow-hidden rounded-2xl border bg-card shadow-sm">
        <img key={active} src={current.image} alt={current.label} className="h-64 w-full object-cover sm:h-96" />
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-14 text-center text-muted-foreground">
            <PackageOpen className="h-8 w-8" />
            <p className="font-medium text-foreground">Bu bo'limda hozircha mahsulot yo'q</p>
            <p className="text-sm">Sotuvchilar mahsulot qo'shishi bilan shu yerda paydo bo'ladi.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <article key={p._id} className="overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
                <ProductImage src={p.image} category={p.category} alt={p.name} className="h-40 w-full object-cover" />
                <div className="space-y-1 p-4">
                  <h3 className="truncate font-semibold">{p.name}</h3>
                  <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">{p.description || "Tavsif kiritilmagan"}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold">{formatPrice(p.price)}</span>
                    <span className={cn("text-xs font-medium", p.stock > 0 ? "text-emerald-600" : "text-destructive")}>
                      {p.stock > 0 ? `${p.stock} ta mavjud` : "Tugagan"}
                    </span>
                  </div>
                  {p.sellerName && <p className="truncate text-xs text-muted-foreground">Sotuvchi: {p.sellerName}</p>}
                  {isSeller ? (
                    <p className="pt-2 text-center text-xs text-muted-foreground">Sotuvchi hisobi bilan xarid qilib bo'lmaydi</p>
                  ) : (
                    <Button
                      className="mt-2 w-full"
                      variant={items.some((i) => i.id === p._id) ? "outline" : "default"}
                      disabled={p.stock < 1}
                      onClick={() => addToCart(p)}
                    >
                      {items.some((i) => i.id === p._id) ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                      {p.stock < 1 ? "Tugagan" : items.some((i) => i.id === p._id) ? "Savatda — yana qo'shish" : "Savatga"}
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        {hasMore && !loading && (
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? "Yuklanmoqda..." : "Ko'proq ko'rsatish"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
