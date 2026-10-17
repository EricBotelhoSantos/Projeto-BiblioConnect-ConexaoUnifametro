import { daysBetween, toISODate } from "@/lib/rules";
import { useCurrentUser, useDb } from "@/services/library";

export interface AlertItem {
  id: string;
  tone: "danger" | "warning" | "success";
  title: string;
  text: string;
  to: string;
}

export function useAlerts(): AlertItem[] {
  const db = useDb();
  const user = useCurrentUser();
  if (!user) return [];
  const today = toISODate(new Date());
  const title = (id: string) => db.books.find((b) => b.id === id)?.titulo ?? "Livro";

  if (user.role === "ADMIN") {
    const atrasos = db.loans.filter((l) => !l.dataDevolucao && l.dataDevolucaoPrevista < today);
    const pend = db.reservations.filter((r) => r.status === "PENDENTE");
    const out: AlertItem[] = [];
    if (atrasos.length) out.push({ id: "atr", tone: "danger", title: `${atrasos.length} empréstimo(s) em atraso`, text: "Verifique a lista de empréstimos.", to: "/admin/emprestimos" });
    if (pend.length) out.push({ id: "pen", tone: "warning", title: `${pend.length} reserva(s) pendente(s)`, text: "Acompanhe a fila de reservas.", to: "/admin/reservas" });
    return out;
  }

  const out: AlertItem[] = [];
  db.loans
    .filter((l) => l.usuarioId === user.id && !l.dataDevolucao)
    .forEach((l) => {
      const dias = daysBetween(today, l.dataDevolucaoPrevista);
      if (dias < 0) out.push({ id: l.id, tone: "danger", title: "Empréstimo em atraso", text: `${title(l.livroId)} — ${-dias} dia(s) de atraso.`, to: "/painel/emprestimos" });
      else if (dias <= 3) out.push({ id: l.id, tone: "warning", title: "Devolução próxima", text: `${title(l.livroId)} vence em ${dias === 0 ? "hoje" : `${dias} dia(s)`}.`, to: "/painel/emprestimos" });
    });
  db.reservations
    .filter((r) => r.usuarioId === user.id && r.status === "DISPONIVEL")
    .forEach((r) => out.push({ id: r.id, tone: "success", title: "Reserva disponível", text: `${title(r.livroId)} aguarda retirada no balcão.`, to: "/painel/reservas" }));
  return out;
}
