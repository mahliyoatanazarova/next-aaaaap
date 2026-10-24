"use client";
import Navbar from "@/components/navbar";
import RoleGuard from "@/components/role-guard";
import OrdersList from "@/components/orders-list";

export default function OrdersPage() {
  return (
    <>
      <Navbar />
      <RoleGuard role="user">
        <main className="container max-w-4xl py-10">
          <h1 className="text-3xl font-bold tracking-tight">Buyurtmalarim</h1>
          <p className="mb-8 mt-1 text-muted-foreground">Barcha buyurtmalaringiz va ularning holati.</p>
          <OrdersList role="user" />
        </main>
      </RoleGuard>
    </>
  );
}
