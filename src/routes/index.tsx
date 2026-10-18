import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookMarked,
  CalendarClock,
  LibraryBig,
  MonitorSmartphone,
  RefreshCw,
  Search,
  Bookmark,
} from "lucide-react";
import { useState } from "react";
import hero from "@/assets/hero-biblioteca.jpg";
import { BookCover } from "@/components/book-cover";
import { PublicLayout } from "@/components/public-layout";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/categories";
import { availableCopies } from "@/lib/rules";
import { useDb } from "@/services/library";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BiblioConnect — Seu conhecimento começa aqui" },
      {
        name: "description",
        content:
          "Consulte o acervo, acompanhe empréstimos, reserve livros e agende salas de estudo na biblioteca UNIFAMETRO.",
      },
      { property: "og:title", content: "BiblioConnect — Biblioteca UNIFAMETRO" },
      {
        property: "og:description",
        content: "Consulte o acervo, reserve livros e agende salas de estudo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const popular = ["Código Limpo", "Paulo Freire", "Fisiologia", "Machado de Assis", "Spring Boot"];

const services = [
  {
    icon: Search,
    title: "Consulta ao acervo",
    text: "Pesquise por título, autor, assunto ou ISBN.",
    to: "/catalogo",
    demo: true,
  },
  {
    icon: BookMarked,
    title: "Meus empréstimos",
    text: "Acompanhe prazos e o histórico de retiradas.",
    to: "/painel/emprestimos",
    demo: true,
  },
  {
    icon: Bookmark,
    title: "Reservas de livros",
    text: "Entre na fila quando todos os exemplares estiverem emprestados.",
    to: "/painel/reservas",
    demo: true,
  },
  {
    icon: RefreshCw,
    title: "Renovação",
    text: "Solicite a renovação de empréstimos dentro das regras.",
    to: "/painel/emprestimos",
    demo: true,
  },
  {
    icon: CalendarClock,
    title: "Espaços de estudo",
    text: "Agende salas sem choque de horários.",
    to: "/painel/espacos",
    demo: true,
  },
  {
    icon: MonitorSmartphone,
    title: "Recursos digitais",
    text: "Acesso às bases e bibliotecas virtuais oficiais.",
    to: "/painel/recursos",
    demo: false,
  },
] as const;

function Home() {
  const db = useDb();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const go = (term: string) => navigate({ to: "/catalogo", search: { q: term } });
  const destaques = db.books.filter((b) => b.destaque).slice(0, 6);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-paper-grid">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-accent-foreground">
              <LibraryBig className="h-3.5 w-3.5" /> Biblioteca UNIFAMETRO
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
              Seu conhecimento <span className="text-primary">começa aqui.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Descubra livros, explore conteúdos acadêmicos e organize sua experiência na biblioteca
              em um só lugar.
            </p>
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                go(q);
              }}
              className="mt-8 flex max-w-xl flex-col gap-2 rounded-2xl border bg-card p-2 shadow-lift sm:flex-row"
            >
              <label htmlFor="hero-busca" className="sr-only">
                Pesquisar no acervo
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="hero-busca"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Título, autor, assunto ou ISBN"
                  className="h-12 border-0 pl-10 text-base shadow-none focus-visible:ring-0"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6">
                Pesquisar
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Populares:</span>
              {popular.map((p) => (
                <button
                  key={p}
                  onClick={() => go(p)}
                  className="rounded-full border bg-card px-3 py-1 font-medium transition-colors hover:border-primary hover:text-primary"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src={hero}
              alt="Estudantes lendo em uma biblioteca universitária"
              width={1280}
              height={1024}
              className="aspect-[5/4] w-full rounded-3xl object-cover shadow-lift"
            />
            <div className="absolute -bottom-6 left-6 hidden rounded-2xl border bg-card p-4 shadow-lift sm:block">
              <p className="text-xs text-muted-foreground">Acervo demonstrativo</p>
              <p className="font-display text-2xl font-bold text-ink">{db.books.length} títulos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold sm:text-3xl">Explore por área</h2>
        <p className="mt-1 text-muted-foreground">
          Categorias ilustrativas do acervo demonstrativo.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {CATEGORIES.map((c) => (
            <Link
              key={c.name}
              to="/catalogo"
              search={{ categoria: c.name }}
              className="group flex flex-col gap-3 rounded-xl border bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-card"
            >
              <c.icon className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold leading-tight">{c.name}</span>
              <span className="text-xs text-muted-foreground">
                {db.books.filter((b) => b.categoria === c.name).length} títulos
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="scroll-mt-20 bg-ink py-16 text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">Serviços da biblioteca</h2>
          <p className="mt-1 text-ink-muted">
            Os serviços marcados como demonstração funcionam neste protótipo com dados fictícios.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <Link
                key={s.title}
                to={s.to}
                className="group rounded-xl border border-sidebar-border bg-sidebar-accent p-6 transition hover:border-primary"
              >
                <div className="flex items-center justify-between">
                  <s.icon className="h-6 w-6 text-primary" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                    {s.demo ? "Demonstração" : "Serviço oficial"}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">{s.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Acessar <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Destaques */}
      <section id="destaques" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Em destaque</h2>
            <p className="mt-1 text-muted-foreground">Seleção fictícia para demonstração.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/catalogo">
              Ver acervo <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {destaques.map((b) => {
            const autor = db.authors.find((a) => a.id === b.autorId)?.nome;
            return (
              <Link key={b.id} to="/livro/$id" params={{ id: b.id }} className="group">
                <BookCover
                  book={b}
                  author={autor}
                  className="transition group-hover:-translate-y-1 group-hover:shadow-lift"
                />
                <p className="mt-3 line-clamp-2 text-sm font-semibold group-hover:text-primary">
                  {b.titulo}
                </p>
                <p className="text-xs text-muted-foreground">{autor}</p>
                <div className="mt-1.5">
                  {availableCopies(db, b) > 0 ? (
                    <StatusBadge tone="success">Disponível</StatusBadge>
                  ) : (
                    <StatusBadge tone="danger">Emprestado</StatusBadge>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </PublicLayout>
  );
}
