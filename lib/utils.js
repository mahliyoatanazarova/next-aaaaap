import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const CATEGORIES = [
  { value: "computers", label: "Computers", image: "/images/computers.png" },
  { value: "appliances", label: "Appliances", image: "/images/appliances.png" },
  { value: "smartphones", label: "Smartphones", image: "/images/smartphones.png" },
];

export const categoryImage = (c) => CATEGORIES.find((x) => x.value === c)?.image;
export const categoryLabel = (c) => CATEGORIES.find((x) => x.value === c)?.label || c;

export const formatPrice = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

export const ORDER_STATUS = {
  pending: { label: "Kutilmoqda", cls: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Tasdiqlandi", cls: "bg-blue-100 text-blue-800" },
  delivered: { label: "Yetkazildi", cls: "bg-emerald-100 text-emerald-800" },
  cancelled: { label: "Bekor qilindi", cls: "bg-red-100 text-red-800" },
};
