import Image from "next/image";
import { KEYRA_LOGO_SRC } from "@/lib/keyraBrandAssets";

export function KeyraLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      src={KEYRA_LOGO_SRC}
      alt="Keyra"
      width={120}
      height={32}
      className={`h-8 w-auto object-contain ${className}`}
      priority
    />
  );
}
