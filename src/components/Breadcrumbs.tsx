import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { JsonLd } from "./JsonLd";

type BreadcrumbsProps = {
  /** Full trail including the current page (last item, rendered as text). */
  items: { label: string; href: string }[];
  className?: string;
};

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          items.map((item) => ({ name: item.label, path: item.href })),
        )}
      />
      <nav aria-label="Fil d’Ariane" className={className}>
        <ol className="flex flex-wrap items-center gap-y-1 text-[13px] font-medium">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.href} className="flex items-center">
                {index > 0 && (
                  <ChevronRight
                    className="mx-1.5 h-3.5 w-3.5 text-steel-dark"
                    aria-hidden
                  />
                )}
                {isLast ? (
                  <span aria-current="page" className="text-gold">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-steel transition-colors duration-200 hover:text-gold"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
