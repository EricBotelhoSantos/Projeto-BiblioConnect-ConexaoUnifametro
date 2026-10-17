// Serviço simulado. Cada função corresponde a um futuro endpoint REST
// (Spring Boot). Para integrar a API real, substitua o corpo das funções por
// chamadas fetch mantendo as mesmas assinaturas.
import { useSyncExternalStore } from "react";
import { createSeed } from "@/lib/mock-data";
import {
  DEMO_RULES,
  addDays,
  availableCopies,
  canDeleteAuthor,
  canDeleteBook,
  canLend,
  canRenew,
  canReserve,
  hasConflict,
  toISODate,
} from "@/lib/rules";
import type { Activity, Author, Book, Database, Result, User } from "@/lib/types";

const DB_KEY = "biblioconnect:db:v1";
const SESSION_KEY = "biblioconnect:session:v1";

interface State {
  db: Database;
  sessionId: string | null;
  hydrated: boolean;
}

const seed = createSeed();
let state: State = { db: seed, sessionId: null, hydrated: false };
const serverState = state;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}
function commit(db: Database) {
  state = { ...state, db };
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {
    /* ignore */
  }
  emit();
}

export function hydrateStore() {
  if (state.hydrated) return;
  let db = state.db;
  let sessionId: string | null = null;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) db = JSON.parse(raw);
    sessionId = localStorage.getItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  state = { db, sessionId, hydrated: true };
  emit();
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(serverState),
  );
}

export const useDb = () => useStore((s) => s.db);
export const useHydrated = () => useStore((s) => s.hydrated);
export function useCurrentUser(): User | null {
  const db = useDb();
  const id = useStore((s) => s.sessionId);
  return db.users.find((u) => u.id === id) ?? null;
}

const today = () => toISODate(new Date());
const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const ok = (message: string): Result => ({ ok: true, message });
const fail = (message: string): Result => ({ ok: false, message });
const titleOf = (db: Database, livroId: string) => db.books.find((b) => b.id === livroId)?.titulo ?? "Livro";
function log(db: Database, usuarioId: string, tipo: Activity["tipo"], texto: string): Activity[] {
  return [{ id: uid("ac"), usuarioId, tipo, texto, em: today() }, ...db.activities];
}

// ---------- Autenticação demonstrativa ----------
export function login(matricula: string, senha: string, manter: boolean): Result & { user?: User } {
  const user = state.db.users.find((u) => u.matricula === matricula.trim());
  if (!user || user.senha !== senha) return fail("Matrícula ou senha inválidas.");
  if (!user.ativo) return fail("Esta conta de demonstração está inativa.");
  state = { ...state, sessionId: user.id };
  try {
    if (manter) localStorage.setItem(SESSION_KEY, user.id);
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  emit();
  return { ok: true, message: `Bem-vindo(a), ${user.nome.split(" ")[0]}!`, user };
}

export function logout() {
  state = { ...state, sessionId: null };
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  emit();
}

export function resetDemo() {
  commit(createSeed());
}

// ---------- Estudante ----------
export function reserveBook(usuarioId: string, livroId: string): Result {
  const db = state.db;
  const book = db.books.find((b) => b.id === livroId);
  if (!book) return fail("Livro não encontrado.");
  const check = canReserve(db, usuarioId, book);
  if (!check.ok) return fail(check.message);
  commit({
    ...db,
    reservations: [
      { id: uid("r"), usuarioId, livroId, criadaEm: today(), status: "PENDENTE" },
      ...db.reservations,
    ],
    activities: log(db, usuarioId, "RESERVA", `Reserva realizada: ${book.titulo}`),
  });
  return ok("Reserva registrada! Você será avisado quando um exemplar estiver disponível.");
}

export function cancelReservation(reservaId: string): Result {
  const db = state.db;
  const r = db.reservations.find((x) => x.id === reservaId);
  if (!r || (r.status !== "PENDENTE" && r.status !== "DISPONIVEL")) return fail("Reserva não pode ser cancelada.");
  commit({
    ...db,
    reservations: db.reservations.map((x) => (x.id === reservaId ? { ...x, status: "CANCELADA" } : x)),
    activities: log(db, r.usuarioId, "CANCELAMENTO", `Reserva cancelada: ${titleOf(db, r.livroId)}`),
  });
  return ok("Reserva cancelada.");
}

export function renewLoan(loanId: string): Result {
  const db = state.db;
  const loan = db.loans.find((l) => l.id === loanId);
  if (!loan) return fail("Empréstimo não encontrado.");
  const check = canRenew(db, loan, today());
  if (!check.ok) return fail(check.message);
  const nova = addDays(loan.dataDevolucaoPrevista, DEMO_RULES.diasPorRenovacao);
  commit({
    ...db,
    loans: db.loans.map((l) =>
      l.id === loanId ? { ...l, dataDevolucaoPrevista: nova, renovacoes: l.renovacoes + 1 } : l,
    ),
    activities: log(db, loan.usuarioId, "RENOVACAO", `Renovação aprovada: ${titleOf(db, loan.livroId)}`),
  });
  return ok(`Renovação aprovada. Nova data de devolução: ${nova.split("-").reverse().join("/")}.`);
}

export function bookRoom(usuarioId: string, salaId: string, data: string, inicio: number, fim: number): Result {
  const db = state.db;
  const sala = db.rooms.find((r) => r.id === salaId);
  if (!sala) return fail("Espaço não encontrado.");
  if (fim <= inicio || fim - inicio > DEMO_RULES.maxHorasAgendamento)
    return fail(`Selecione de 1 a ${DEMO_RULES.maxHorasAgendamento} horas consecutivas.`);
  if (data < today()) return fail("Não é possível agendar em datas passadas.");
  if (hasConflict(db.bookings, salaId, data, inicio, fim))
    return fail("Conflito (409): o horário selecionado já está ocupado.");
  commit({
    ...db,
    bookings: [
      { id: uid("g"), usuarioId, salaId, data, horaInicio: inicio, horaFim: fim, status: "CONFIRMADO" },
      ...db.bookings,
    ],
    activities: log(db, usuarioId, "AGENDAMENTO", `Agendamento confirmado: ${sala.nome}`),
  });
  return ok(`${sala.nome} agendada das ${inicio}h às ${fim}h.`);
}

export function cancelBooking(id: string): Result {
  const db = state.db;
  const b = db.bookings.find((x) => x.id === id);
  if (!b || b.status !== "CONFIRMADO") return fail("Agendamento não pode ser cancelado.");
  const sala = db.rooms.find((r) => r.id === b.salaId);
  commit({
    ...db,
    bookings: db.bookings.map((x) => (x.id === id ? { ...x, status: "CANCELADO" } : x)),
    activities: log(db, b.usuarioId, "CANCELAMENTO", `Agendamento cancelado: ${sala?.nome ?? "Espaço"}`),
  });
  return ok("Agendamento cancelado.");
}

// ---------- Administração ----------
export function saveBook(data: Omit<Book, "id"> & { id?: string }): Result {
  const db = state.db;
  if (!data.titulo.trim()) return fail("Informe o título.");
  if (!db.authors.some((a) => a.id === data.autorId)) return fail("Selecione um autor válido.");
  if (data.exemplares < 1) return fail("Informe ao menos 1 exemplar.");
  if (data.id) {
    const emprestados = db.loans.filter((l) => l.livroId === data.id && !l.dataDevolucao).length;
    if (data.exemplares < emprestados)
      return fail(`Há ${emprestados} exemplar(es) emprestado(s); a quantidade não pode ser menor.`);
    commit({ ...db, books: db.books.map((b) => (b.id === data.id ? ({ ...b, ...data } as Book) : b)) });
    return ok("Livro atualizado.");
  }
  commit({ ...db, books: [{ ...data, id: uid("b") } as Book, ...db.books] });
  return ok("Livro cadastrado.");
}

export function deleteBook(id: string): Result {
  const db = state.db;
  const check = canDeleteBook(db, id);
  if (!check.ok) return fail(check.message);
  commit({ ...db, books: db.books.filter((b) => b.id !== id) });
  return ok("Livro excluído.");
}

export function saveAuthor(a: Omit<Author, "id"> & { id?: string }): Result {
  const db = state.db;
  if (!a.nome.trim()) return fail("Informe o nome do autor.");
  if (a.id) {
    commit({ ...db, authors: db.authors.map((x) => (x.id === a.id ? ({ ...x, ...a } as Author) : x)) });
    return ok("Autor atualizado.");
  }
  commit({ ...db, authors: [...db.authors, { ...a, id: uid("au") } as Author] });
  return ok("Autor cadastrado.");
}

export function deleteAuthor(id: string): Result {
  const db = state.db;
  const check = canDeleteAuthor(db, id);
  if (!check.ok) return fail(check.message);
  commit({ ...db, authors: db.authors.filter((a) => a.id !== id) });
  return ok("Autor excluído.");
}

export function toggleUserStatus(id: string): Result {
  const db = state.db;
  const u = db.users.find((x) => x.id === id);
  if (!u) return fail("Usuário não encontrado.");
  if (u.role === "ADMIN") return fail("A conta administrativa não pode ser desativada.");
  commit({ ...db, users: db.users.map((x) => (x.id === id ? { ...x, ativo: !x.ativo } : x)) });
  return ok(u.ativo ? "Conta desativada." : "Conta reativada.");
}

export function registerLoan(usuarioId: string, livroId: string): Result {
  const db = state.db;
  const book = db.books.find((b) => b.id === livroId);
  if (!book) return fail("Livro não encontrado.");
  const check = canLend(db, usuarioId, book);
  if (!check.ok) return fail(check.message);
  const t = today();
  commit({
    ...db,
    loans: [
      { id: uid("l"), usuarioId, livroId, dataRetirada: t, dataDevolucaoPrevista: addDays(t, DEMO_RULES.prazoEmprestimoDias), renovacoes: 0 },
      ...db.loans,
    ],
    // reserva "disponível" do próprio usuário é concluída ao retirar
    reservations: db.reservations.map((r) =>
      r.usuarioId === usuarioId && r.livroId === livroId && (r.status === "DISPONIVEL" || r.status === "PENDENTE")
        ? { ...r, status: "CONCLUIDA" }
        : r,
    ),
    activities: log(db, usuarioId, "EMPRESTIMO", `Empréstimo registrado: ${book.titulo}`),
  });
  return ok("Empréstimo registrado.");
}

export function registerReturn(loanId: string): Result {
  const db = state.db;
  const loan = db.loans.find((l) => l.id === loanId);
  if (!loan || loan.dataDevolucao) return fail("Empréstimo já encerrado.");
  let reservations = db.reservations;
  // Primeira reserva pendente na fila passa a "disponível para retirada"
  const next = [...db.reservations]
    .filter((r) => r.livroId === loan.livroId && r.status === "PENDENTE")
    .sort((a, b) => a.criadaEm.localeCompare(b.criadaEm))[0];
  if (next) reservations = reservations.map((r) => (r.id === next.id ? { ...r, status: "DISPONIVEL" } : r));
  commit({
    ...db,
    loans: db.loans.map((l) => (l.id === loanId ? { ...l, dataDevolucao: today() } : l)),
    reservations,
    activities: log(db, loan.usuarioId, "DEVOLUCAO", `Livro devolvido: ${titleOf(db, loan.livroId)}`),
  });
  return ok(next ? "Devolução registrada. A próxima reserva da fila foi liberada." : "Devolução registrada.");
}

export function confirmReservation(id: string): Result {
  const db = state.db;
  const r = db.reservations.find((x) => x.id === id);
  if (!r || r.status !== "PENDENTE") return fail("Apenas reservas pendentes podem ser confirmadas.");
  const book = db.books.find((b) => b.id === r.livroId);
  if (!book || availableCopies(db, book) <= db.reservations.filter((x) => x.livroId === r.livroId && x.status === "DISPONIVEL").length)
    return fail("Ainda não há exemplar disponível para esta reserva.");
  commit({ ...db, reservations: db.reservations.map((x) => (x.id === id ? { ...x, status: "DISPONIVEL" } : x)) });
  return ok("Reserva liberada para retirada.");
}
