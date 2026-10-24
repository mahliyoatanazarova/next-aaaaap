"use client";
import { useEffect, useRef, useState } from "react";
import { categoryImage } from "@/lib/utils";

// Mahsulot rasmi. Havola ishlamasa, kategoriya rasmi ko'rsatiladi.
// referrerPolicy="no-referrer" — ko'p saytlar (Google, Pinterest va h.k.) rasmni boshqa saytga bermasligini chetlab o'tadi.
export default function ProductImage({ src, category, alt = "", className }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    // Rasm hydration'dan oldin xato bergan bo'lsa onError chaqirilmaydi — shu yerda tekshiramiz
    const img = ref.current;
    setFailed(!!src && !!img && img.complete && img.naturalWidth === 0);
  }, [src]);
  const url = !src || failed ? categoryImage(category) : src;
  return (
    <img
      ref={ref}
      src={url}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

// Formada kiritilgan havolani darrov ko'rsatadi va xatoni aytadi
export function ImagePreview({ src }) {
  const [state, setState] = useState("loading");
  useEffect(() => setState("loading"), [src]);
  if (!src) return null;
  if (state === "error")
    return (
      <p className="text-xs text-destructive">
        Rasm yuklanmadi. Rasmning o'ziga olib boradigan havola kiriting (.jpg, .png, .webp bilan tugaydigan).
      </p>
    );
  return (
    <img
      src={src}
      alt="Ko'rinish"
      referrerPolicy="no-referrer"
      className="h-32 w-full rounded-lg border object-cover"
      onLoad={() => setState("ok")}
      onError={() => setState("error")}
    />
  );
}
