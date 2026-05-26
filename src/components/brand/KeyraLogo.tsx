import Image from "next/image";
import { KEYRA_LOGO_SRC } from "@/lib/keyraBrandAssets";

export function KeyraLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-block h-8 w-[7.5rem] shrink-0 ${className}`}>
      <Image
        src={KEYRA_LOGO_SRC}
        alt="Keyra"
        fill
        sizes="120px"
        className="object-contain object-left"
        priority
      />
    </span>
  );
}
