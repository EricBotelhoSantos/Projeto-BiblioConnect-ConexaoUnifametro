// Dados fictícios para demonstração. Nenhum dado real de estudantes.
import { addDays, toISODate } from "./rules";
import type { Database } from "./types";

export function createSeed(): Database {
  const today = toISODate(new Date());
  const d = (n: number) => addDays(today, n);

  return {
    users: [
      { id: "u1", matricula: "2024000123", nome: "Ana Beatriz Lima", email: "ana.lima@demo.biblioconnect", curso: "Análise e Desenvolvimento de Sistemas", periodo: "4º semestre", role: "ESTUDANTE", ativo: true, senha: "demo123" },
      { id: "u2", matricula: "2023000456", nome: "Carlos Eduardo Rocha", email: "carlos.rocha@demo.biblioconnect", curso: "Direito", periodo: "6º semestre", role: "ESTUDANTE", ativo: true, senha: "demo123" },
      { id: "u3", matricula: "2025000789", nome: "Júlia Martins Freitas", email: "julia.freitas@demo.biblioconnect", curso: "Enfermagem", periodo: "2º semestre", role: "ESTUDANTE", ativo: true, senha: "demo123" },
      { id: "u4", matricula: "2022000321", nome: "Rafael Souza Nunes", email: "rafael.nunes@demo.biblioconnect", curso: "Administração", periodo: "8º semestre", role: "ESTUDANTE", ativo: false, senha: "demo123" },
      { id: "u5", matricula: "2024000654", nome: "Marina Costa Alves", email: "marina.alves@demo.biblioconnect", curso: "Pedagogia", periodo: "3º semestre", role: "ESTUDANTE", ativo: true, senha: "demo123" },
      { id: "a1", matricula: "admin", nome: "Equipe da Biblioteca", email: "biblioteca@demo.biblioconnect", curso: "Administração do acervo", role: "ADMIN", ativo: true, senha: "admin123" },
    ],
    authors: [
      { id: "au1", nome: "Robert C. Martin", nacionalidade: "Estados Unidos" },
      { id: "au2", nome: "Martin Fowler", nacionalidade: "Reino Unido" },
      { id: "au3", nome: "Erich Gamma", nacionalidade: "Suíça" },
      { id: "au4", nome: "Abraham Silberschatz", nacionalidade: "Estados Unidos" },
      { id: "au5", nome: "Arthur C. Guyton", nacionalidade: "Estados Unidos" },
      { id: "au6", nome: "Philip Kotler", nacionalidade: "Estados Unidos" },
      { id: "au7", nome: "Idalberto Chiavenato", nacionalidade: "Brasil" },
      { id: "au8", nome: "Paulo Freire", nacionalidade: "Brasil" },
      { id: "au9", nome: "Machado de Assis", nacionalidade: "Brasil" },
      { id: "au10", nome: "Clarice Lispector", nacionalidade: "Brasil" },
      { id: "au11", nome: "Sérgio Buarque de Holanda", nacionalidade: "Brasil" },
      { id: "au12", nome: "Rachel de Queiroz", nacionalidade: "Brasil" },
      { id: "au13", nome: "Hans Kelsen", nacionalidade: "Áustria" },
      { id: "au14", nome: "Craig Walls", nacionalidade: "Estados Unidos" },
    ],
    books: [
      { id: "b1", titulo: "Código Limpo", autorId: "au1", categoria: "Tecnologia e Computação", editora: "Alta Books", ano: 2009, isbn: "978-8576082675", descricao: "Princípios e práticas para escrever código legível, testável e fácil de manter.", exemplares: 3, localizacao: "Estante T-04 · Prateleira 2", destaque: true },
      { id: "b2", titulo: "Padrões de Arquitetura de Aplicações Corporativas", autorId: "au2", categoria: "Tecnologia e Computação", editora: "Bookman", ano: 2006, isbn: "978-8536306384", descricao: "Catálogo de padrões para camadas, persistência e apresentação em sistemas corporativos.", exemplares: 2, localizacao: "Estante T-04 · Prateleira 3", destaque: true },
      { id: "b3", titulo: "Padrões de Projeto", autorId: "au3", categoria: "Tecnologia e Computação", editora: "Bookman", ano: 2000, isbn: "978-8573076103", descricao: "Os 23 padrões clássicos de design orientado a objetos.", exemplares: 1, localizacao: "Estante T-05 · Prateleira 1" },
      { id: "b4", titulo: "Sistema de Banco de Dados", autorId: "au4", categoria: "Tecnologia e Computação", editora: "GEN LTC", ano: 2020, isbn: "978-8595157507", descricao: "Modelagem relacional, SQL, transações e integridade referencial.", exemplares: 2, localizacao: "Estante T-06 · Prateleira 2" },
      { id: "b5", titulo: "Spring Boot em Ação", autorId: "au14", categoria: "Tecnologia e Computação", editora: "Novatec", ano: 2016, isbn: "978-8575225097", descricao: "Desenvolvimento de APIs REST com Java e Spring Boot.", exemplares: 2, localizacao: "Estante T-06 · Prateleira 4", destaque: true },
      { id: "b6", titulo: "Tratado de Fisiologia Médica", autorId: "au5", categoria: "Saúde", editora: "GEN Guanabara Koogan", ano: 2021, isbn: "978-8595158634", descricao: "Referência em fisiologia humana para cursos da área da saúde.", exemplares: 4, localizacao: "Estante S-01 · Prateleira 1", destaque: true },
      { id: "b7", titulo: "Fundamentos de Enfermagem", autorId: "au5", categoria: "Saúde", editora: "Elsevier", ano: 2018, descricao: "Conceitos e procedimentos essenciais do cuidado em enfermagem.", exemplares: 2, localizacao: "Estante S-02 · Prateleira 3" },
      { id: "b8", titulo: "Administração de Marketing", autorId: "au6", categoria: "Administração", editora: "Pearson", ano: 2019, isbn: "978-8543024974", descricao: "Estratégias de mercado, posicionamento e comportamento do consumidor.", exemplares: 3, localizacao: "Estante A-02 · Prateleira 1" },
      { id: "b9", titulo: "Introdução à Teoria Geral da Administração", autorId: "au7", categoria: "Administração", editora: "Manole", ano: 2014, isbn: "978-8520436691", descricao: "Panorama das escolas e teorias administrativas.", exemplares: 1, localizacao: "Estante A-01 · Prateleira 2", destaque: true },
      { id: "b10", titulo: "Teoria Pura do Direito", autorId: "au13", categoria: "Direito", editora: "WMF Martins Fontes", ano: 2009, isbn: "978-8578271107", descricao: "Obra fundamental sobre a ciência jurídica e a norma.", exemplares: 2, localizacao: "Estante D-03 · Prateleira 1" },
      { id: "b11", titulo: "Pedagogia da Autonomia", autorId: "au8", categoria: "Educação", editora: "Paz e Terra", ano: 1996, isbn: "978-8577531639", descricao: "Saberes necessários à prática educativa crítica.", exemplares: 3, localizacao: "Estante E-01 · Prateleira 2", destaque: true },
      { id: "b12", titulo: "Pedagogia do Oprimido", autorId: "au8", categoria: "Educação", editora: "Paz e Terra", ano: 1968, descricao: "Clássico sobre educação, diálogo e transformação social.", exemplares: 1, localizacao: "Estante E-01 · Prateleira 3" },
      { id: "b13", titulo: "Raízes do Brasil", autorId: "au11", categoria: "Ciências Humanas", editora: "Companhia das Letras", ano: 1936, isbn: "978-8535908541", descricao: "Interpretação da formação social e cultural brasileira.", exemplares: 2, localizacao: "Estante H-02 · Prateleira 1" },
      { id: "b14", titulo: "Dom Casmurro", autorId: "au9", categoria: "Literatura", editora: "Penguin-Companhia", ano: 1899, descricao: "Bentinho, Capitu e a dúvida mais célebre da literatura brasileira.", exemplares: 3, localizacao: "Estante L-01 · Prateleira 2", destaque: true },
      { id: "b15", titulo: "A Hora da Estrela", autorId: "au10", categoria: "Literatura", editora: "Rocco", ano: 1977, isbn: "978-8532508126", descricao: "A trajetória de Macabéa, nordestina no Rio de Janeiro.", exemplares: 1, localizacao: "Estante L-02 · Prateleira 1" },
      { id: "b16", titulo: "O Quinze", autorId: "au12", categoria: "Literatura", editora: "José Olympio", ano: 1930, isbn: "978-8503012317", descricao: "Romance sobre a seca de 1915 no sertão cearense.", exemplares: 2, localizacao: "Estante L-02 · Prateleira 3", destaque: true },
    ],
    loans: [
      { id: "l1", usuarioId: "u1", livroId: "b1", dataRetirada: d(-10), dataDevolucaoPrevista: d(4), renovacoes: 0 },
      { id: "l2", usuarioId: "u1", livroId: "b3", dataRetirada: d(-12), dataDevolucaoPrevista: d(2), renovacoes: 1 },
      { id: "l3", usuarioId: "u1", livroId: "b16", dataRetirada: d(-40), dataDevolucaoPrevista: d(-26), dataDevolucao: d(-27), renovacoes: 0 },
      { id: "l4", usuarioId: "u2", livroId: "b9", dataRetirada: d(-20), dataDevolucaoPrevista: d(-3), renovacoes: 0 },
      { id: "l5", usuarioId: "u3", livroId: "b15", dataRetirada: d(-5), dataDevolucaoPrevista: d(9), renovacoes: 0 },
      { id: "l6", usuarioId: "u5", livroId: "b12", dataRetirada: d(-3), dataDevolucaoPrevista: d(11), renovacoes: 0 },
      { id: "l7", usuarioId: "u2", livroId: "b6", dataRetirada: d(-60), dataDevolucaoPrevista: d(-46), dataDevolucao: d(-48), renovacoes: 0 },
    ],
    reservations: [
      { id: "r1", usuarioId: "u1", livroId: "b15", criadaEm: d(-2), status: "PENDENTE" },
      { id: "r2", usuarioId: "u3", livroId: "b9", criadaEm: d(-4), status: "PENDENTE" },
    ],
    rooms: [
      { id: "s101", nome: "Sala de Estudos 101", capacidade: 6, recursos: ["Projetor", "Mesa redonda"] },
      { id: "s102", nome: "Sala de Estudos 102", capacidade: 4, recursos: ["Quadro branco"] },
      { id: "s201", nome: "Cabine Individual 201", capacidade: 1, recursos: ["Tomada", "Iluminação de leitura"] },
      { id: "s202", nome: "Sala de Grupo 202", capacidade: 10, recursos: ["TV", "Quadro branco", "Videoconferência"] },
    ],
    bookings: [
      { id: "g1", usuarioId: "u1", salaId: "s101", data: d(1), horaInicio: 14, horaFim: 16, status: "CONFIRMADO" },
      { id: "g2", usuarioId: "u2", salaId: "s101", data: d(0), horaInicio: 10, horaFim: 12, status: "CONFIRMADO" },
      { id: "g3", usuarioId: "u3", salaId: "s102", data: d(0), horaInicio: 15, horaFim: 17, status: "CONFIRMADO" },
      { id: "g4", usuarioId: "u5", salaId: "s202", data: d(1), horaInicio: 9, horaFim: 11, status: "CONFIRMADO" },
    ],
    activities: [
      { id: "ac1", usuarioId: "u1", tipo: "AGENDAMENTO", texto: "Agendamento confirmado: Sala de Estudos 101", em: d(-1) },
      { id: "ac2", usuarioId: "u1", tipo: "RESERVA", texto: "Reserva realizada: A Hora da Estrela", em: d(-2) },
      { id: "ac3", usuarioId: "u1", tipo: "RENOVACAO", texto: "Renovação aprovada: Padrões de Projeto", em: d(-5) },
      { id: "ac4", usuarioId: "u1", tipo: "EMPRESTIMO", texto: "Empréstimo registrado: Código Limpo", em: d(-10) },
      { id: "ac5", usuarioId: "u1", tipo: "DEVOLUCAO", texto: "Livro devolvido: O Quinze", em: d(-27) },
    ],
  };
}
