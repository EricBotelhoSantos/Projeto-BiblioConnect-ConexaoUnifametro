import { Link } from "@tanstack/react-router";
import { BookX, LayoutGrid, List, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BookCover } from "./book-cover";
import { EmptyState, StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/categories";
import { availableCopies } from "@/lib/rules";
import type { Book, Database } from "@/lib/types";
import { useDb } from "@/services/library";
import { cn } from "@/lib/utils";

const PAGE = 8;

export function matchesQuery(db: Database, b: Book, q: string) {
  if (!q) return true;
  const t = q.toLowerCase();
  const autor = db.authors.find((a) => a.id === b.autorId)?.nome ?? "";
  return [b.titulo, autor, b.categoria, b.isbn ?? "", b.descricao, b.editora].some((f) => f.toLowerCase().includes(t));
}

export function Catalog({ initialQuery = "", initialCategory = "", detailBase }: { initialQuery?: string; initialCategory?: string; detailBase: "/livro/$id" | "/painel/livro/$id" }) {
  const db = useDb();
  const [q, setQ] = useState(initialQuery);
  const [cat, setCat] = useState(initialCategory || "todas");
  const [disp, setDisp] = useState("todos");
  const [sort, setSort] = useState("titulo");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [q, cat, disp, sort]);

  const results = useMemo(() => {
    const autor = (b: Book) => db.authors.find((a) => a.id === b.autorId)?.nome ?? "";
    return db.books
      .filter((b) => matchesQuery(db, b, q))
      .filter((b) => cat === "todas" || b.categoria === cat)
      .filter((b) => disp === "todos" || (disp === "disponivel" ? availableCopies(db, b) > 0 : availableCopies(db, b) === 0))
      .sort((a, b) =>
        sort === "titulo" ? a.titulo.localeCompare(b.titulo) : sort === "autor" ? autor(a).localeCompare(autor(b)) : b.ano - a.ano,
      );
  }, [db, q, cat, disp, sort]);

  const pages = Math.max(1, Math.ceil(results.length / PAGE));
  const shown = results.slice((page - 1) * PAGE, page * PAGE);
  const clear = () => {
    setQ("");
    setCat("todas");
    setDisp("todos");
  };

  return (
    <div>
      <div className="rounded-xl border bg-card p-4 shadow-card">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="busca-acervo" className="sr-only">Pesquisar no acervo</label>
          <Input id="busca-acervo" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Título, autor, assunto, ISBN ou palavra-chave" className="h-11 pl-9" />
        </form>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger aria-label="Filtrar por categoria"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={disp} onValueChange={setDisp}>
            <SelectTrigger aria-label="Filtrar por disponibilidade"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Qualquer disponibilidade</SelectItem>
              <SelectItem value="disponivel">Disponível para retirada</SelectItem>
              <SelectItem value="emprestado">Todos emprestados</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger aria-label="Ordenar"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="titulo">Ordenar por título</SelectItem>
              <SelectItem value="autor">Ordenar por autor</SelectItem>
              <SelectItem value="ano">Mais recentes</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1" role="group" aria-label="Modo de visualização">
            <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setView("grid")} aria-label="Grade" aria-pressed={view === "grid"}><LayoutGrid /></Button>
            <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setView("list")} aria-label="Lista" aria-pressed={view === "list"}><List /></Button>
          </div>
        </div>
      </div>

      <p className="my-4 text-sm text-muted-foreground" aria-live="polite">
        {results.length} {results.length === 1 ? "resultado" : "resultados"}
      </p>

      {results.length === 0 ? (
        <EmptyState icon={BookX} title="Nenhum livro encontrado" description="Tente outros termos ou remova os filtros aplicados." action={<Button variant="outline" onClick={clear}>Limpar filtros</Button>} />
      ) : (
        <ul className={cn(view === "grid" ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" : "flex flex-col gap-3")}>
          {shown.map((b) => {
            const autor = db.authors.find((a) => a.id === b.autorId)?.nome ?? "";
            const avail = availableCopies(db, b);
            return (
              <li key={b.id}>
                <Link
                  to={detailBase}
                  params={{ id: b.id }}
                  className={cn(
                    "group flex h-full rounded-xl border bg-card p-3 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift",
                    view === "grid" ? "flex-col" : "items-center gap-4",
                  )}
                >
                  <BookCover book={b} author={autor} size={view === "grid" ? "md" : "sm"} />
                  <div className={cn("flex flex-1 flex-col", view === "grid" && "mt-3")}>
                    <span className="text-xs font-medium text-primary">{b.categoria}</span>
                    <span className="mt-0.5 line-clamp-2 font-semibold leading-snug group-hover:text-primary">{b.titulo}</span>
                    <span className="text-sm text-muted-foreground">{autor} · {b.ano}</span>
                    {view === "list" && <span className="mt-1 hidden text-sm text-muted-foreground sm:block">{b.descricao}</span>}
                    <span className="mt-auto pt-2">
                      {avail > 0 ? (
                        <StatusBadge tone="success">{avail} de {b.exemplares} disponíveis</StatusBadge>
                      ) : (
                        <StatusBadge tone="danger">Emprestado</StatusBadge>
                      )}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Paginação" className="mt-6 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</Button>
          <span className="text-sm text-muted-foreground">Página {page} de {pages}</span>
          <Button variant="outline" size="sm" disabled={page === pages} onClick={() => setPage(page + 1)}>Próxima</Button>
        </nav>
      )}
    </div>
  );
}
