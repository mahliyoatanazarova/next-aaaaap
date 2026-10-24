"use client";
import ProductImage, { ImagePreview } from "@/components/product-image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Boxes, DollarSign, Layers, Loader2, Pencil, PackageOpen, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Dialog } from "@/components/ui/dialog";
import { CATEGORIES, categoryLabel, formatPrice } from "@/lib/utils";

const empty = { name: "", description: "", price: "", stock: "", category: "computers", image: "" };

export default function ProductsManager({ userName }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api(`/api/products?search=${encodeURIComponent(search)}`);
      setProducts(data.products);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const stats = useMemo(
    () => ({
      count: products.length,
      units: products.reduce((s, p) => s + p.stock, 0),
      value: products.reduce((s, p) => s + p.price * p.stock, 0),
    }),
    [products]
  );

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setFormOpen(true);
  }
  function openEdit(p) {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", price: p.price, stock: p.stock, category: p.category, image: p.image || "" });
    setFormOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api(editing ? `/api/products/${editing._id}` : "/api/products", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      toast.success(editing ? "Mahsulot yangilandi" : "Mahsulot qo'shildi");
      setFormOpen(false);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await api(`/api/products/${toDelete._id}`, { method: "DELETE" });
      toast.success("Mahsulot o'chirildi");
      setToDelete(null);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  const statCards = [
    { icon: Boxes, label: "Mahsulotlar", value: stats.count },
    { icon: Layers, label: "Ombordagi jami soni", value: stats.units },
    { icon: DollarSign, label: "Ombor qiymati", value: formatPrice(stats.value) },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salom, {userName}</h1>
          <p className="mt-1 text-muted-foreground">Mahsulotlaringizni qo'shing, tahrirlang va o'chiring.</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> Mahsulot qo'shish</Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((s) => (
          <Card key={s.label} className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b p-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Mahsulot qidirish..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <PackageOpen className="h-9 w-9 text-muted-foreground" />
            <p className="font-medium">{search ? "Hech narsa topilmadi" : "Hali mahsulot qo'shilmagan"}</p>
            {!search && <Button className="mt-2" onClick={openCreate}><Plus className="h-4 w-4" /> Birinchi mahsulotni qo'shish</Button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Mahsulot</th>
                  <th className="px-4 py-3 font-medium">Kategoriya</th>
                  <th className="px-4 py-3 text-right font-medium">Narxi</th>
                  <th className="px-4 py-3 text-right font-medium">Soni</th>
                  <th className="px-4 py-3 text-right font-medium">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage src={p.image} category={p.category} alt="" className="h-11 w-11 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{p.name}</p>
                          <p className="max-w-[260px] truncate text-xs text-muted-foreground">{p.description || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">{categoryLabel(p.category)}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-right">{p.stock}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Tahrirlash"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setToDelete(p)} aria-label="O'chirish" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
        description="Ma'lumotlar bosh sahifadagi katalogda ko'rinadi."
      >
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">Nomi</Label>
            <Input id="p-name" value={form.name} onChange={set("name")} placeholder="iPhone 15 Pro" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-price">Narxi ($)</Label>
              <Input id="p-price" type="number" min="0" step="0.01" value={form.price} onChange={set("price")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-stock">Soni</Label>
              <Input id="p-stock" type="number" min="0" step="1" value={form.stock} onChange={set("stock")} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-cat">Kategoriya</Label>
            <Select id="p-cat" value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-img">Rasm havolasi (ixtiyoriy)</Label>
            <Input id="p-img" type="url" value={form.image} onChange={set("image")} placeholder="https://site.com/rasm.jpg" />
            <ImagePreview src={form.image} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-desc">Tavsif</Label>
            <Textarea id="p-desc" value={form.description} onChange={set("description")} placeholder="Qisqacha ma'lumot" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Bekor qilish</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Saqlash" : "Qo'shish"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={!!toDelete} onClose={() => setToDelete(null)} title="Mahsulotni o'chirish" description={toDelete ? `"${toDelete.name}" butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.` : ""}>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setToDelete(null)}>Bekor qilish</Button>
          <Button variant="destructive" onClick={remove} disabled={deleting}>
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            O'chirish
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
