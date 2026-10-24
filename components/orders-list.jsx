"use client";
import ProductImage from "@/components/product-image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ClipboardList, Loader2, MapPin, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { ORDER_STATUS, cn, formatPrice } from "@/lib/utils";

export default function OrdersList({ role }) {
  const isSeller = role === "seller";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    try {
      setOrders((await api("/api/orders")).orders);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function setStatus(id, status) {
    setBusy(id + status);
    try {
      const { order } = await api(`/api/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setOrders((prev) => prev.map((o) => (o._id === id ? order : o)));
      toast.success("Buyurtma holati yangilandi");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  }

  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      {isSeller && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-5"><p className="text-sm text-muted-foreground">Jami buyurtmalar</p><p className="text-2xl font-bold">{orders.length}</p></Card>
          <Card className="p-5"><p className="text-sm text-muted-foreground">Kutilayotgan</p><p className="text-2xl font-bold">{orders.filter((o) => o.status === "pending").length}</p></Card>
          <Card className="p-5"><p className="text-sm text-muted-foreground">Tushum (bekor qilinmaganlar)</p><p className="text-2xl font-bold">{formatPrice(revenue)}</p></Card>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[["all", "Barchasi"], ...Object.entries(ORDER_STATUS).map(([k, v]) => [k, v.label])].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={cn("rounded-full border px-3 py-1 text-sm", filter === k ? "border-foreground bg-foreground text-background" : "bg-card text-muted-foreground hover:text-foreground")}
          >
            {label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <ClipboardList className="h-9 w-9" />
          <p className="font-medium text-foreground">Buyurtmalar topilmadi</p>
        </div>
      ) : (
        shown.map((o) => {
          const st = ORDER_STATUS[o.status] || { label: o.status, cls: "bg-muted text-muted-foreground" };
          return (
            <Card key={o._id} className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-5 py-3 text-sm">
                <div>
                  <span className="font-semibold">Buyurtma #{o._id.slice(-6).toUpperCase()}</span>
                  <span className="ml-3 text-muted-foreground">{new Date(o.createdAt).toLocaleString("en-GB")}</span>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", st.cls)}>{st.label}</span>
              </div>
              <div className="space-y-3 p-5">
                {o.items.map((i) => (
                  <div key={String(i.product)} className="flex items-center gap-3">
                    <ProductImage src={i.image} category={i.category} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{i.name}</p>
                      <p className="text-sm text-muted-foreground">{i.quantity} × {formatPrice(i.price)}</p>
                    </div>
                    <p className="font-medium">{formatPrice(i.quantity * i.price)}</p>
                  </div>
                ))}
                <div className="grid gap-1 border-t pt-3 text-sm text-muted-foreground">
                  {isSeller ? (
                    <p className="flex items-center gap-2"><User className="h-4 w-4" /> {o.buyerName} · {o.buyerEmail}</p>
                  ) : (
                    <p className="flex items-center gap-2"><User className="h-4 w-4" /> Sotuvchi: {o.sellerName}</p>
                  )}
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {o.phone}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {o.address}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <p className="text-lg font-bold">Jami: {formatPrice(o.total)}</p>
                  <div className="flex gap-2">
                    {isSeller && o.status === "pending" && (
                      <Button size="sm" disabled={!!busy} onClick={() => setStatus(o._id, "confirmed")}>Tasdiqlash</Button>
                    )}
                    {isSeller && o.status === "confirmed" && (
                      <Button size="sm" disabled={!!busy} onClick={() => setStatus(o._id, "delivered")}>Yetkazildi</Button>
                    )}
                    {((isSeller && (o.status === "pending" || o.status === "confirmed")) || (!isSeller && o.status === "pending")) && (
                      <Button size="sm" variant="outline" className="text-destructive" disabled={!!busy} onClick={() => setStatus(o._id, "cancelled")}>
                        Bekor qilish
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
