import { getToken } from "@/components/auth-provider";

// Token avtomatik ravishda Authorization sarlavhasiga qo'shiladi
export async function api(url, options = {}) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("token");
    window.location.href = "/sign-in";
  }
  if (!res.ok) throw new Error(data.error || "Xatolik yuz berdi");
  return data;
}
