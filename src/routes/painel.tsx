import { Outlet, createFileRoute } from "@tanstack/react-router";
import {
  BookMarked,
  BookOpenText,
  Bookmark,
  CalendarClock,
  Gauge,
  MonitorSmartphone,
  UserRound,
} from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";

const nav: NavItem[] = [
  { to: "/painel", label: "Visão geral", icon: Gauge, exact: true },
  { to: "/painel/catalogo", label: "Acervo", icon: BookOpenText },
  { to: "/painel/emprestimos", label: "Empréstimos", icon: BookMarked },
  { to: "/painel/reservas", label: "Reservas", icon: Bookmark },
  { to: "/painel/espacos", label: "Espaços de estudo", icon: CalendarClock },
  { to: "/painel/recursos", label: "Recursos digitais", icon: MonitorSmartphone },
  { to: "/painel/perfil", label: "Meu perfil", icon: UserRound },
];

// Layout da área do estudante: valida a sessão e renderiza o shell do painel.
export const Route = createFileRoute("/painel")({
  component: () => (
    <AppShell role="ESTUDANTE" items={nav}>
      <Outlet />
    </AppShell>
  ),
});
