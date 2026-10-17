// Tipos de domínio espelhando as entidades do artigo (TB_USUARIOS, TB_LIVROS,
// TB_EMPRESTIMOS, TB_SALAS_ESTUDO, TB_AGENDAMENTOS) + reservas e autores.

export type Role = "ESTUDANTE" | "ADMIN";

export interface User {
  id: string;
  matricula: string;
  nome: string;
  email: string;
  curso: string;
  periodo?: string;
  role: Role;
  ativo: boolean;
  senha: string; // apenas para o protótipo demonstrativo
}

export interface Author {
  id: string;
  nome: string;
  nacionalidade: string;
}

export type Category =
  | "Tecnologia e Computação"
  | "Saúde"
  | "Administração"
  | "Direito"
  | "Educação"
  | "Ciências Humanas"
  | "Literatura";

export interface Book {
  id: string;
  titulo: string;
  autorId: string;
  categoria: Category;
  editora: string;
  ano: number;
  isbn?: string;
  descricao: string;
  exemplares: number;
  localizacao: string;
  destaque?: boolean;
}

export type BookStatus = "DISPONIVEL" | "EMPRESTADO";

export interface Loan {
  id: string;
  usuarioId: string;
  livroId: string;
  dataRetirada: string; // ISO date
  dataDevolucaoPrevista: string;
  dataDevolucao?: string;
  renovacoes: number;
}

export type ReservationStatus = "PENDENTE" | "DISPONIVEL" | "CONCLUIDA" | "CANCELADA";

export interface Reservation {
  id: string;
  usuarioId: string;
  livroId: string;
  criadaEm: string;
  status: ReservationStatus;
}

export interface Room {
  id: string;
  nome: string;
  capacidade: number;
  recursos: string[];
}

export interface Booking {
  id: string;
  usuarioId: string;
  salaId: string;
  data: string; // YYYY-MM-DD
  horaInicio: number; // hora cheia, ex.: 14
  horaFim: number; // exclusiva, ex.: 16
  status: "CONFIRMADO" | "CANCELADO";
}

export interface Activity {
  id: string;
  usuarioId: string;
  tipo: "EMPRESTIMO" | "RESERVA" | "DEVOLUCAO" | "AGENDAMENTO" | "RENOVACAO" | "CANCELAMENTO";
  texto: string;
  em: string;
}

export interface Database {
  users: User[];
  authors: Author[];
  books: Book[];
  loans: Loan[];
  reservations: Reservation[];
  rooms: Room[];
  bookings: Booking[];
  activities: Activity[];
}

export type Result = { ok: true; message: string } | { ok: false; message: string };
