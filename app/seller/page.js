"use client";
import { useState } from "react";
import Navbar from "@/components/navbar";
import RoleGuard from "@/components/role-guard";
import ProductsManager from "@/components/products-manager";
import OrdersList from "@/components/orders-list";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

export default function SellerPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("products");
  return (
    <>
      <Navbar />
      <RoleGuard role="seller">
        <main className="container py-10">
          <div className="mb-8 inline-flex rounded-xl bg-muted p-1">
            {[["products", "Mahsulotlar"], ["orders", "Buyurtmalar"]].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={cn("rounded-lg px-5 py-2 text-sm font-medium", tab === k ? "bg-foreground text-background shadow" : "text-muted-foreground hover:text-foreground")}
              >
                {label}
              </button>
            ))}
          </div>
          {tab === "products" ? <ProductsManager userName={user?.name} /> : <OrdersList role="seller" />}
        </main>
      </RoleGuard>
    </>
  );
}
