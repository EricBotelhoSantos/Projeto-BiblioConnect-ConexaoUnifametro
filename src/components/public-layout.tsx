import { Link } from "@tanstack/react-router";
import { LayoutDashboard, LogIn, Menu, Search } from "lucide-react";
import { useState } from "react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCurrentUser } from "@/services/library";

const nav = [
  { to: "/", label: "Início", hash: undefined },
  { to: "/catalogo", label: "Acervo", hash: undefined },
  { to: "/", label: "Serviços", hash: "servicos" },
  { to: "/", label: "Destaques", hash: "destaques" },
] as const;

export function PublicHeader() {
  const user = useCurrentUser();
  const [open, setOpen] = useState(false);
  const area = user?.role === "ADMIN" ? "/admin" : "/painel";
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Brand />
        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              hash={n.hash}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeOptions={{ exact: true, includeHash: true }}
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button asChild variant="outline">
              <Link to={area}>
                <LayoutDashboard /> Meu painel
              </Link>
            </Button>
          ) : (
            <Button asChild variant="ghost">
              <Link to="/login">
                <LogIn /> Entrar
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link to="/catalogo">
              <Search /> Consultar acervo
            </Link>
          </Button>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="mt-8 flex flex-col gap-1">
              {nav.map((n) => (
                <Link key={n.label} to={n.to} hash={n.hash} onClick={() => setOpen(false)} className="rounded-md px-3 py-3 font-medium hover:bg-muted">
                  {n.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild variant="outline">
                  <Link to={user ? area : "/login"} onClick={() => setOpen(false)}>
                    {user ? "Meu painel" : "Entrar"}
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/catalogo" onClick={() => setOpen(false)}>Consultar acervo</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Brand inverted />
          <p className="mt-4 max-w-xs text-sm text-ink-muted">
            Portal digital da biblioteca para a comunidade acadêmica do Centro Universitário Fametro — UNIFAMETRO.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Navegação</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/catalogo" className="hover:text-primary">Consultar acervo</Link></li>
            <li><Link to="/login" className="hover:text-primary">Entrar no portal</Link></li>
            <li><Link to="/" hash="servicos" className="hover:text-primary">Serviços</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">Institucional</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="https://unifametro.edu.br/" target="_blank" rel="noreferrer" className="hover:text-primary">Site oficial UNIFAMETRO</a></li>
            <li><a href="https://unifametro.edu.br/biblioteca-unifametro/" target="_blank" rel="noreferrer" className="hover:text-primary">Biblioteca UNIFAMETRO</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sidebar-border">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-ink-muted sm:px-6">
          Protótipo acadêmico — Conexão Unifametro 2026. Dados fictícios, sem integração com os sistemas oficiais da instituição.
        </p>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
