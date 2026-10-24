"use client";
import ProductImage from "@/components/product-image";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Navbar from "@/components/navbar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart-provider";
import { api } from "@/lib/api";
import { cn, formatPrice } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { items, ready, setQty, remove, clear, total } = useCart();
  const [form, setForm] = useState({ phone: "", address: "" });
  const [sending, setSending] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function checkout(e) {
    e.preventDefault();
    setSending(true);
    try {
      await api("/api/orders", {
        method: "POST",
        body: JSON.stringify({ ...form, items: items.map((i) => ({ productId: i.id, quantity: i.qty })) }),
      });
      clear();
      toast.success("Buyurtmangiz qabul qilindi!");
      router.push("/orders");
    } catch (err) {
      toast.error(err.message);
      setSending(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="container max-w-5xl py-10">
        <h1 className="text-3xl font-bold tracking-tight">Savat</h1>

        {!ready || loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : items.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed py-20 text-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">Savatingiz bo'sh</p>
            <Link href="/#catalog" className={cn(buttonVariants({ variant: "dark" }))}>Katalogga o'tish</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {items.map((i) => (
                <Card key={i.id} className="flex items-center gap-4 p-4">
                  <ProductImage src={i.image} category={i.category} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{i.name}</p>
                    <p className="text-sm text-muted-foreground">{formatPrice(i.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQty(i.id, i.qty - 1)} aria-label="Kamaytirish"><Minus className="h-3.5 w-3.5" /></Button>
                      <span className="w-8 text-center text-sm font-medium">{i.qty}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQty(i.id, i.qty + 1)} disabled={i.qty >= i.stock} aria-label="Ko'paytirish"><Plus className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(i.price * i.qty)}</p>
                    <Button variant="ghost" size="icon" className="mt-1 text-destructive hover:text-destructive" onClick={() => remove(i.id)} aria-label="O'chirish"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="h-fit space-y-4 p-6">
              <h2 className="text-lg font-semibold">Buyurtma</h2>
              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-muted-foreground">Jami</span>
                <span className="text-2xl font-bold">{formatPrice(total)}</span>
              </div>
              {!user ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Buyurtma berish uchun hisobingizga kiring.</p>
                  <Link href="/sign-in?next=/cart" className={cn(buttonVariants({ variant: "dark" }), "w-full")}>Kirish</Link>
                  <Link href="/sign-up?next=/cart" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>Ro'yxatdan o'tish</Link>
                </div>
              ) : user.role === "seller" ? (
                <p className="text-sm text-muted-foreground">Sotuvchi hisobi bilan xarid qilib bo'lmaydi. Xaridor hisobi bilan kiring.</p>
              ) : (
                <form onSubmit={checkout} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" type="tel" placeholder="+998 90 123 45 67" value={form.phone} onChange={set("phone")} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Yetkazib berish manzili</Label>
                    <Textarea id="address" placeholder="Shahar, ko'cha, uy" value={form.address} onChange={set("address")} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={sending}>
                    {sending && <Loader2 className="h-4 w-4 animate-spin" />} Buyurtma berish
                  </Button>
                </form>
              )}
            </Card>
          </div>
        )}
      </main>
    </>
  );
}
