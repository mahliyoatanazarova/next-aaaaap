"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ShoppingBag, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/logo";

export default function AuthForm({ mode }) {
  const isSignUp = mode === "sign-up";
  const router = useRouter();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);

  const target = (u) => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (u.role === "seller") return "/seller";
    return next && next.startsWith("/") ? next : "/";
  };
  // ?next=... ni Kirish ↔ Ro'yxatdan o'tish havolasida saqlab qolish uchun
  const [nextQs, setNextQs] = useState("");
  useEffect(() => {
    setNextQs(window.location.search);
  }, []);
  useEffect(() => {
    if (user) router.replace(target(user));
  }, [user, router]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${isSignUp ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik yuz berdi");
      toast.success(isSignUp ? "Hisob yaratildi!" : "Xush kelibsiz!");
      login(data.token, data.user);
      router.push(target(data.user));
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-900 p-4">
      <div className="mb-6 rounded-xl bg-white/95 px-4 py-2"><Logo /></div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle>{isSignUp ? "Hisob yaratish" : "Hisobingizga kiring"}</CardTitle>
          <CardDescription>
            {isSignUp ? "Hisob turini tanlang va ma'lumotlaringizni kiriting." : "Email va parolingizni kiriting."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Hisob turi">
                {[["user", "Xaridor", ShoppingBag], ["seller", "Sotuvchi", Store]].map(([k, label, Icon]) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={form.role === k}
                    onClick={() => setForm({ ...form, role: k })}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors",
                      form.role === k ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
            )}
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Ism</Label>
                <Input id="name" placeholder="Rustam" value={form.name} onChange={set("name")} required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" value={form.email} onChange={set("email")} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Parol</Label>
              <Input id="password" type="password" minLength={6} placeholder="Kamida 6 ta belgi" value={form.password} onChange={set("password")} required />
            </div>
            <Button type="submit" variant="dark" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSignUp ? "Ro'yxatdan o'tish" : "Kirish"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? "Hisobingiz bormi? " : "Hisobingiz yo'qmi? "}
            <Link href={(isSignUp ? "/sign-in" : "/sign-up") + nextQs} className="font-medium text-primary hover:underline">
              {isSignUp ? "Kirish" : "Ro'yxatdan o'tish"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
