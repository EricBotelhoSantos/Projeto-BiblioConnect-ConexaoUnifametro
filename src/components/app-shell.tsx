import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Loader2, LogOut, Menu, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { initials } from "@/lib/format";
import type { Role } from "@/lib/types";
import { logout, useCurrentUser, useHydrated } from "@/services/library";
import { useAlerts } from "@/hooks/use-alerts";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

function SideNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav aria-label="Menu do painel" className="flex flex-col gap-1">
      {items.map((i) => (
        <Link
          key={i.to}
          to={i.to}
          onClick={onNavigate}
          activeOptions={{ exact: i.exact ?? false }}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{
            className:
              "bg-sidebar-primary !text-sidebar-primary-foreground hover:!bg-sidebar-primary",
          }}
        >
          <i.icon className="h-4 w-4" aria-hidden="true" />
          {i.label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({
  role,
  items,
  children,
}: {
  role: Role;
  items: NavItem[];
  children: React.ReactNode;
}) {
  const hydrated = useHydrated();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const alerts = useAlerts();
  const home = role === "ADMIN" ? "/admin" : "/painel";

  useEffect(() => {
    if (!hydrated) return;
    if (!user) navigate({ to: "/login" });
    else if (user.role !== role) navigate({ to: user.role === "ADMIN" ? "/admin" : "/painel" });
  }, [hydrated, user, role, navigate]);

  if (!hydrated || !user || user.role !== role)
    return (
      <div className="flex min-h-screen items-center justify-center" role="status">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="sr-only">Carregando</span>
      </div>
    );

  const sair = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col bg-sidebar p-5 lg:flex">
        <Brand inverted to={home} />
        <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-ink-muted">
          {role === "ADMIN" ? "Administração" : "Área do estudante"}
        </p>
        <SideNav items={items} />
        <div className="mt-auto rounded-lg bg-sidebar-accent p-3 text-xs text-ink-muted">
          Protótipo com dados fictícios.
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-none bg-sidebar p-5">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Brand inverted to={home} />
              <div className="mt-8">
                <SideNav items={items} onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <p className="hidden font-display font-semibold sm:block">
            Olá, {user.nome.split(" ")[0]}
          </p>
          <div className="ml-auto flex items-center gap-1">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/">Portal</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Notificações (${alerts.length})`}
                  className="relative"
                >
                  <Bell />
                  {alerts.length > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notificações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {alerts.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-muted-foreground">
                    Nenhuma notificação no momento.
                  </p>
                ) : (
                  alerts.map((a) => (
                    <DropdownMenuItem key={a.id} asChild>
                      <Link to={a.to} className="flex flex-col items-start gap-0.5">
                        <span className="font-medium">{a.title}</span>
                        <span className="text-xs text-muted-foreground">{a.text}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 rounded-full" aria-label="Menu do perfil">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-ink text-ink-foreground text-sm font-semibold">
                      {initials(user.nome)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block">{user.nome}</span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    Matrícula {user.matricula}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {role === "ESTUDANTE" && (
                  <DropdownMenuItem asChild>
                    <Link to="/painel/perfil">
                      <UserIcon /> Meu perfil
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={sair}>
                  <LogOut /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={sair}
              className="ml-2 hidden md:inline-flex"
            >
              <LogOut /> Sair
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
