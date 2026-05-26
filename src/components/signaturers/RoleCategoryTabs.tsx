"use client";

import {
  ROLE_CATEGORY_LABELS,
  type RoleCategory,
} from "@/lib/types/documentSignature";

const CATEGORIES: RoleCategory[] = [
  "all",
  "created_by_me",
  "signed_by_me",
  "lead",
  "support",
  "management",
  "associated",
  "imported_vault",
];

type Props = {
  value: RoleCategory;
  onChange: (category: RoleCategory) => void;
};

export function RoleCategoryTabs({ value, onChange }: Props) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Document role categories"
    >
      {CATEGORIES.map((category) => {
        const active = value === category;
        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(category)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? "bg-[var(--keyra-ink-on-light)] text-white"
                : "bg-black/[0.04] text-[var(--keyra-ink-muted-on-light)] hover:bg-black/[0.06]"
            }`}
          >
            {ROLE_CATEGORY_LABELS[category]}
          </button>
        );
      })}
    </div>
  );
}
