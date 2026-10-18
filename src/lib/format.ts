import { daysBetween, isOverdue } from "./rules";
import type { Loan, Reservation } from "./types";

export const fmtDate = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");

export const initials = (nome: string) =>
  nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

/** Situação exibida de um empréstimo, conforme as regras demonstrativas. */
export function loanSituation(loan: Loan, today: string) {
  if (loan.dataDevolucao)
    return { tone: "neutral" as const, label: `Devolvido em ${fmtDate(loan.dataDevolucao)}` };
  const dias = daysBetween(today, loan.dataDevolucaoPrevista);
  if (isOverdue(loan, today))
    return { tone: "danger" as const, label: `Atrasado há ${-dias} dia(s)` };
  if (dias === 0) return { tone: "warning" as const, label: "Vence hoje" };
  if (dias <= 3) return { tone: "warning" as const, label: `Vence em ${dias} dia(s)` };
  return { tone: "info" as const, label: `${dias} dia(s) restantes` };
}

/** Rótulos exibidos para os status de reserva. */
export const reservationStatus: Record<
  Reservation["status"],
  { tone: "warning" | "success" | "neutral"; label: string }
> = {
  PENDENTE: { tone: "warning", label: "Na fila" },
  DISPONIVEL: { tone: "success", label: "Pronta para retirada" },
  CONCLUIDA: { tone: "neutral", label: "Concluída" },
  CANCELADA: { tone: "neutral", label: "Cancelada" },
};
