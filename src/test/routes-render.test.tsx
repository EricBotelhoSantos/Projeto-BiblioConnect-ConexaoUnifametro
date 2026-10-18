import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { Route as RootRoute } from "@/routes/__root";
import { hydrateStore, login, logout, resetDemo } from "@/services/library";

// O shell da raiz renderiza <html>/<body>. Dentro do jsdom isso é inválido no
// container do testing-library (React desmonta a árvore), então o teste de
// render remove o shell e monta apenas a lógica interna das rotas.
delete (RootRoute.options as unknown as Record<string, unknown>)["shellComponent"];

/**
 * Teste de fumaça: cada rota precisa renderizar de verdade (shell + página)
 * sem erros. O histórico em memória evita tocar no history do jsdom.
 */
function renderRoute(path: string) {
  const router = createRouter({
    routeTree,
    context: { queryClient: new QueryClient() },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  return render(<RouterProvider router={router} />);
}

beforeEach(() => {
  // Hidrata primeiro para que o efeito das rotas não sobrescreva a sessão do teste.
  hydrateStore();
  resetDemo();
  logout();
});

describe("Rotas públicas", () => {
  it("renderiza a página inicial", async () => {
    renderRoute("/");
    expect(await screen.findByRole("heading", { name: /começa aqui/i })).toBeInTheDocument();
  });

  it("renderiza o catálogo público", async () => {
    renderRoute("/catalogo");
    expect(await screen.findByRole("heading", { name: "Consulta ao acervo" })).toBeInTheDocument();
  });

  it("renderiza o detalhe de um livro", async () => {
    renderRoute("/livro/b1");
    expect(await screen.findByRole("heading", { name: "Código Limpo" })).toBeInTheDocument();
  });

  it("renderiza o login", async () => {
    renderRoute("/login");
    expect(await screen.findByRole("heading", { name: "Entrar" })).toBeInTheDocument();
  });

  it("renderiza a recuperação de senha", async () => {
    renderRoute("/recuperar-senha");
    expect(await screen.findByRole("heading", { name: "Recuperar senha" })).toBeInTheDocument();
  });

  it("renderiza a página 404 para rotas desconhecidas", async () => {
    renderRoute("/rota-que-nao-existe");
    expect(
      await screen.findByRole("heading", { name: "Página não encontrada", level: 2 }),
    ).toBeInTheDocument();
  });
});

describe("Painel do estudante", () => {
  beforeEach(() => {
    login("2024000123", "demo123", false);
  });

  it("renderiza o visão geral", async () => {
    renderRoute("/painel");
    expect(await screen.findByRole("heading", { name: "Olá, Ana!" })).toBeInTheDocument();
  });

  it("renderiza o acervo dentro do painel", async () => {
    renderRoute("/painel/catalogo");
    expect(
      await screen.findByRole("heading", { name: "Acervo da biblioteca" }),
    ).toBeInTheDocument();
  });

  it("renderiza o detalhe de livro dentro do painel", async () => {
    renderRoute("/painel/livro/b1");
    expect(await screen.findByRole("heading", { name: "Código Limpo" })).toBeInTheDocument();
  });

  it("renderiza os empréstimos", async () => {
    renderRoute("/painel/emprestimos");
    expect(await screen.findByRole("heading", { name: "Meus empréstimos" })).toBeInTheDocument();
  });

  it("renderiza as reservas", async () => {
    renderRoute("/painel/reservas");
    expect(await screen.findByRole("heading", { name: "Minhas reservas" })).toBeInTheDocument();
  });

  it("renderiza os espaços de estudo", async () => {
    renderRoute("/painel/espacos");
    expect(await screen.findByRole("heading", { name: "Espaços de estudo" })).toBeInTheDocument();
  });

  it("renderiza os recursos digitais", async () => {
    renderRoute("/painel/recursos");
    expect(await screen.findByRole("heading", { name: "Recursos digitais" })).toBeInTheDocument();
  });

  it("renderiza o perfil", async () => {
    renderRoute("/painel/perfil");
    expect(await screen.findByRole("heading", { name: "Meu perfil" })).toBeInTheDocument();
  });
});

describe("Administração", () => {
  beforeEach(() => {
    login("admin", "admin123", false);
  });

  it("renderiza o visão geral administrativo", async () => {
    renderRoute("/admin");
    expect(await screen.findByRole("heading", { name: "Visão geral" })).toBeInTheDocument();
  });

  it("renderiza a gestão de empréstimos", async () => {
    renderRoute("/admin/emprestimos");
    expect(await screen.findByRole("heading", { name: "Empréstimos" })).toBeInTheDocument();
  });

  it("renderiza a fila de reservas", async () => {
    renderRoute("/admin/reservas");
    expect(await screen.findByRole("heading", { name: "Fila de reservas" })).toBeInTheDocument();
  });

  it("renderiza o cadastro de livros", async () => {
    renderRoute("/admin/livros");
    expect(await screen.findByRole("heading", { name: "Acervo" })).toBeInTheDocument();
  });

  it("renderiza o cadastro de autores", async () => {
    renderRoute("/admin/autores");
    expect(await screen.findByRole("heading", { name: "Autores" })).toBeInTheDocument();
  });

  it("renderiza a gestão de usuários", async () => {
    renderRoute("/admin/usuarios");
    expect(await screen.findByRole("heading", { name: "Usuários" })).toBeInTheDocument();
  });

  it("renderiza os agendamentos", async () => {
    renderRoute("/admin/espacos");
    expect(
      await screen.findByRole("heading", { name: "Agendamentos de espaços" }),
    ).toBeInTheDocument();
  });
});
