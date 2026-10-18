import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  // Livro aberto + nós de conexão (composição do ícone oficial do BiblioConnect)
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={cn("h-9 w-9", className)}>
      {/* laranja institucional */}
      <rect width="40" height="40" rx="10" className="fill-primary" />

      {/* anel de conexão: arcos superior e inferior */}
      <path
        d="M9 11.36a14.3 14.3 0 0 1 22 0"
        fill="none"
        strokeWidth="1.7"
        strokeLinecap="round"
        className="stroke-primary-foreground"
      />
      <path
        d="M9 29.64a14.3 14.3 0 0 0 22 0"
        fill="none"
        strokeWidth="1.7"
        strokeLinecap="round"
        className="stroke-primary-foreground"
      />

      {/* capas em azul-marinho: laterais + base curva do livro */}
      <rect x="3" y="15.5" width="4" height="12.5" rx="2" className="fill-ink" />
      <rect x="33" y="15.5" width="4" height="12.5" rx="2" className="fill-ink" />
      <path d="M6.5 20.8Q20 32 33.5 20.8L33.5 27.9Q20 32.7 6.5 27.9Z" className="fill-ink" />

      {/* páginas abertas */}
      <path
        d="M6.8 12.1Q13.3 13.85 20 18.4v9.3Q13.8 26.25 7.6 22.2Q6.9 17 6.8 12.1Z"
        className="fill-primary-foreground"
      />
      <path
        d="M33.2 12.1Q26.7 13.85 20 18.4v9.3Q26.2 26.25 32.4 22.2Q33.1 17 33.2 12.1Z"
        className="fill-primary-foreground"
      />
      <path
        d="M20 18.4v9.3"
        fill="none"
        strokeWidth=".7"
        strokeOpacity=".15"
        className="stroke-ink"
      />

      {/* nós de conexão */}
      <circle cx="20" cy="6.2" r="3" className="fill-ink" />
      <circle cx="20" cy="34.8" r="3" className="fill-ink" />
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
