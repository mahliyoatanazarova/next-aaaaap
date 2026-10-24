"use client";
import Link from "next/link";
import { ArrowRight, ClipboardList, LayoutDashboard, ShoppingCart } from "lucide-react";
import Logo from "./logo";
import LogoutButton from "./logout-button";
import { buttonVariants } from "./ui/button";
import { useAuth } from "./auth-provider";
import { useCart } from "./cart-provider";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, loading } = useAuth();
  const { count } = useCart();
  const isSeller = user?.role === "seller";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-2">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="/#catalog" className="hover:text-foreground">Katalog</Link>
          <Link href="/#why" className="hover:text-foreground">Afzalliklar</Link>
        </nav>
        <div className="flex min-h-[36px] items-center justify-end gap-2">
          {!isSeller && (
            <Link href="/cart" aria-label="Savat" className={cn(buttonVariants({ variant: "outline", size: "icon" }), "relative")}>
              <ShoppingCart className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>
          )}
          {loading ? null : user ? (
            <>
              <span className="hidden text-sm text-muted-foreground lg:block">{user.name}</span>
              {isSeller ? (
                <Link href="/seller" aria-label="Sotuvchi paneli" className={cn(buttonVariants({ variant: "dark", size: "sm" }))}>
                  <LayoutDashboard className="h-4 w-4" /> <span className="hidden sm:inline">Sotuvchi paneli</span>
                </Link>
              ) : (
                <Link href="/orders" aria-label="Buyurtmalarim" className={cn(buttonVariants({ variant: "dark", size: "sm" }))}>
                  <ClipboardList className="h-4 w-4" /> <span className="hidden sm:inline">Buyurtmalarim</span>
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>Kirish</Link>
              <Link href="/sign-up" className={cn(buttonVariants({ variant: "dark", size: "sm" }))}>
                Boshlash <ArrowRight className="hidden h-4 w-4 sm:block" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
