"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/vault", label: "Vault" },
  { href: "/import", label: "Import" },
  { href: "/worlds", label: "Worlds" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="sm:hidden">
      <button
        type="button"
        className="keyra-btn keyra-btn-ghost px-2 text-sm"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Menu
      </button>
      {open && (
        <nav className="absolute left-0 right-0 top-14 border-b border-[var(--keyra-border)] bg-[var(--keyra-canvas)] px-4 py-3 shadow-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2 text-sm ${
                pathname === link.href ? "bg-black/[0.06] font-medium" : ""
              }`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
