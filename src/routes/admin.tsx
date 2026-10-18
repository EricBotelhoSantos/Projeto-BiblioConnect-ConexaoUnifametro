import { Outlet, createFileRoute } from "@tanstack/react-router";
import {
  BookMarked,
  BookOpenText,
  Bookmark,
  CalendarClock,
  Gauge,
  PenLine,
  Users,
} from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";

const nav: NavItem[] = [
  { to: "/admin", label: "Visão geral", icon: Gauge, exact: true },
  { to: "/admin/emprestimos", label: "Empréstimos", icon: BookMarked },
  { to: "/admin/reservas", label: "Reservas", icon: Bookmark },
  { to: "/admin/livros", label: "Acervo", icon: BookOpenText },
  { to: "/admin/autores", label: "Autores", icon: PenLine },
  { to: "/admin/usuarios", label: "Usuários", icon: Users },
  { to: "/admin/espacos", label: "Agendamentos", icon: CalendarClock },
];

// Layout da área administrativa: valida a sessão e renderiza o shell do painel.
export const Route = createFileRoute("/admin")({
  component: () => (
    <AppShell role="ADMIN" items={nav}>
      <Outlet />
    </AppShell>
  ),
});
