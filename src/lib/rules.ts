// Regras de negócio puras. O artigo define: validação de disponibilidade antes
// do empréstimo, bloqueio de sobreposição de horários em salas (409 Conflict) e
// integridade referencial. Regras de prazo/renovação NÃO constam no documento:
// os valores abaixo são DEMONSTRATIVOS e estão identificados como tal na UI.
import type { Book, Booking, Database, Loan } from "./types";

export const DEMO_RULES = {
  prazoEmprestimoDias: 14,
  diasPorRenovacao: 7,
  maxRenovacoes: 2,
  horaAbertura: 8,
  horaFechamento: 21,
  maxHorasAgendamento: 3,
};

export const toISODate = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (iso: string, days: number) => {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return toISODate(d);
};
export const daysBetween = (fromISO: string, toISO: string) =>
  Math.round(
    (new Date(toISO + "T12:00:00").getTime() - new Date(fromISO + "T12:00:00").getTime()) /
      86400000,
  );

export const activeLoansOf = (db: Database, livroId: string) =>
  db.loans.filter((l) => l.livroId === livroId && !l.dataDevolucao);

export const availableCopies = (db: Database, book: Book) =>
  Math.max(0, book.exemplares - activeLoansOf(db, book.id).length);

export const bookStatus = (db: Database, book: Book) =>
  availableCopies(db, book) > 0 ? "DISPONIVEL" : "EMPRESTADO";

export const isOverdue = (loan: Loan, today: string) =>
  !loan.dataDevolucao && loan.dataDevolucaoPrevista < today;

export function canRenew(db: Database, loan: Loan, today: string) {
  if (loan.dataDevolucao) return { ok: false, message: "Este empréstimo já foi encerrado." };
  if (isOverdue(loan, today))
    return {
      ok: false,
      message: "Empréstimos em atraso não podem ser renovados. Procure o balcão.",
    };
  if (loan.renovacoes >= DEMO_RULES.maxRenovacoes)
    return { ok: false, message: `Limite de ${DEMO_RULES.maxRenovacoes} renovações atingido.` };
  const hasQueue = db.reservations.some(
    (r) => r.livroId === loan.livroId && r.status === "PENDENTE" && r.usuarioId !== loan.usuarioId,
  );
  if (hasQueue) return { ok: false, message: "Há reservas de outros estudantes para este título." };
  return { ok: true, message: "Renovação permitida." };
}

export function canReserve(db: Database, usuarioId: string, book: Book) {
  if (availableCopies(db, book) > 0)
    return { ok: false, message: "Há exemplares disponíveis: retire diretamente no balcão." };
  if (db.loans.some((l) => l.livroId === book.id && l.usuarioId === usuarioId && !l.dataDevolucao))
    return { ok: false, message: "Você já está com um exemplar deste livro." };
  if (
    db.reservations.some(
      (r) =>
        r.livroId === book.id &&
        r.usuarioId === usuarioId &&
        (r.status === "PENDENTE" || r.status === "DISPONIVEL"),
    )
  )
    return { ok: false, message: "Você já possui uma reserva ativa para este livro." };
  return { ok: true, message: "Reserva permitida." };
}

export function canLend(db: Database, usuarioId: string, book: Book) {
  const user = db.users.find((u) => u.id === usuarioId);
  if (!user) return { ok: false, message: "Usuário não encontrado." };
  if (!user.ativo) return { ok: false, message: "Conta do usuário está inativa." };
  if (db.loans.some((l) => l.livroId === book.id && l.usuarioId === usuarioId && !l.dataDevolucao))
    return { ok: false, message: "Usuário já possui um exemplar deste livro." };
  const avail = availableCopies(db, book);
  const readyForOther = db.reservations.filter(
    (r) => r.livroId === book.id && r.status === "DISPONIVEL" && r.usuarioId !== usuarioId,
  ).length;
  if (avail - readyForOther <= 0)
    return { ok: false, message: "Nenhum exemplar disponível para empréstimo." };
  return { ok: true, message: "Empréstimo permitido." };
}

export function canDeleteBook(db: Database, livroId: string) {
  if (db.loans.some((l) => l.livroId === livroId))
    return {
      ok: false,
      message: "Livro possui empréstimos registrados (integridade referencial).",
    };
  if (
    db.reservations.some(
      (r) => r.livroId === livroId && (r.status === "PENDENTE" || r.status === "DISPONIVEL"),
    )
  )
    return { ok: false, message: "Livro possui reservas ativas." };
  return { ok: true, message: "Exclusão permitida." };
}

export function canDeleteAuthor(db: Database, autorId: string) {
  if (db.books.some((b) => b.autorId === autorId))
    return { ok: false, message: "Autor possui livros vinculados." };
  return { ok: true, message: "Exclusão permitida." };
}

/** Sobreposição temporal — equivalente ao 409 Conflict descrito no artigo. */
export function hasConflict(
  bookings: Booking[],
  salaId: string,
  data: string,
  inicio: number,
  fim: number,
) {
  return bookings.some(
    (b) =>
      b.status === "CONFIRMADO" &&
      b.salaId === salaId &&
      b.data === data &&
      inicio < b.horaFim &&
      b.horaInicio < fim,
  );
}
