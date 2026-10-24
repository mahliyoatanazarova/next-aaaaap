import Link from "next/link";
import { Boxes } from "lucide-react";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Boxes className="h-4 w-4" />
      </span>
      Appliances
    </Link>
  );
}
