import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  // Livro aberto + nós de conexão
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={cn("h-9 w-9", className)}>
      <rect width="40" height="40" rx="10" className="fill-primary" />
      <path
        d="M8 12.5c4-1.6 8-1.2 12 1.3v15c-4-2.5-8-2.9-12-1.3z"
        className="fill-primary-foreground"
        opacity=".95"
      />
      <path
        d="M32 12.5c-4-1.6-8-1.2-12 1.3v15c4-2.5 8-2.9 12-1.3z"
        className="fill-primary-foreground"
        opacity=".7"
      />
      <circle cx="20" cy="9" r="2.4" className="fill-ink" />
      <circle cx="11" cy="31.5" r="1.8" className="fill-ink" />
      <circle cx="29" cy="31.5" r="1.8" className="fill-ink" />
    </svg>
  );
}

export function Brand({ inverted, to = "/" }: { inverted?: boolean; to?: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2.5 rounded-lg"
      aria-label="BiblioConnect — início"
    >
      <BrandMark />
      <span className="leading-tight">
        <span
          className={cn(
            "block font-display text-lg font-bold",
            inverted ? "text-ink-foreground" : "text-ink",
          )}
        >
          Biblio<span className="text-primary">Connect</span>
        </span>
        <span
          className={cn(
            "block text-[11px] font-medium uppercase tracking-wider",
            inverted ? "text-ink-muted" : "text-muted-foreground",
          )}
        >
          Biblioteca UNIFAMETRO
        </span>
      </span>
    </Link>
  );
}
