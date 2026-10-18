import { cn } from "@/lib/utils";
import type { Book } from "@/lib/types";

const palette = [
  "bg-cover-1",
  "bg-cover-2",
  "bg-cover-3",
  "bg-cover-4",
  "bg-cover-5",
  "bg-cover-6",
  "bg-cover-7",
];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

/** Capa ilustrativa gerada a partir do título (sem imagens de editoras). */
export function BookCover({
  book,
  author,
  size = "md",
  className,
}: {
  book: Book;
  author?: string | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const color = palette[hash(book.titulo) % palette.length];
  return (
    <div
      role="img"
      aria-label={`Capa ilustrativa de ${book.titulo}`}
      className={cn(
        "relative flex aspect-[2/3] flex-col justify-between overflow-hidden rounded-md p-3 text-primary-foreground shadow-card",
        color,
        size === "sm" && "w-14 p-1.5",
        size === "lg" && "p-6",
        className,
      )}
    >
      <span className="absolute inset-y-0 left-0 w-2 bg-ink/25" />
      <span className="absolute -right-6 -top-6 h-20 w-20 rounded-full border-[10px] border-primary-foreground/15" />
      {size !== "sm" && (
        <>
          <span className="pl-2 text-[10px] font-semibold uppercase tracking-widest opacity-80">
            {book.categoria}
          </span>
          <span
            className={cn(
              "pl-2 font-display font-bold leading-tight",
              size === "lg" ? "text-2xl" : "text-sm",
            )}
          >
            {book.titulo}
          </span>
          <span className="pl-2 text-[11px] opacity-85">{author}</span>
        </>
      )}
    </div>
  );
}
