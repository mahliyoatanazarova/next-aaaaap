import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Headphones, BadgePercent } from "lucide-react";
import Navbar from "@/components/navbar";
import Logo from "@/components/logo";
import Showcase from "@/components/showcase";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  { icon: ShieldCheck, title: "Rasmiy kafolat", text: "Har bir mahsulot 12 oygacha ishlab chiqaruvchi kafolati bilan." },
  { icon: Truck, title: "Tez yetkazib berish", text: "Shahar bo'ylab buyurtmangiz ertasiga eshigingizgacha olib boriladi." },
  { icon: BadgePercent, title: "Halol narxlar", text: "Yashirin to'lovlarsiz. Ko'rgan narxingiz — to'laydigan narxingiz." },
  { icon: Headphones, title: "Doimiy yordam", text: "Savollaringizga har kuni 9:00 dan 21:00 gacha javob beramiz." },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-sky-100 via-indigo-100 to-violet-200">
          <div className="container flex min-h-[520px] flex-col items-center justify-center py-24 text-center">
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
              Uyingiz uchun eng yaxshi texnika.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              Noutbuklar, smartfonlar va maishiy texnika — original, kafolatli va qulay narxlarda.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#catalog" className={cn(buttonVariants({ variant: "dark", size: "lg" }))}>
                Katalogni ko'rish <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/sign-up" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "bg-white/70")}>
                Ro'yxatdan o'tish
              </Link>
            </div>
          </div>
        </section>

        <Showcase />

        <section id="why" className="scroll-mt-20 border-y bg-card py-20">
          <div className="container">
            <h2 className="mx-auto max-w-xl text-center text-3xl font-bold tracking-tight">Nega aynan biz?</h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <div key={f.title}>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="py-10">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo />
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Appliances. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </>
  );
}
