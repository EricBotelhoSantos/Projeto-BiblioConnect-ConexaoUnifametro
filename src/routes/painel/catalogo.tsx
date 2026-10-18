import { createFileRoute } from "@tanstack/react-router";
import { Catalog } from "@/components/catalog";
import { DemoNote, PageHeader } from "@/components/status-badge";

export const Route = createFileRoute("/painel/catalogo")({
  validateSearch: (s: Record<string, unknown>): { q?: string; categoria?: string } => {
    const search: { q?: string; categoria?: string } = {};
    if (typeof s["q"] === "string") search.q = s["q"];
    if (typeof s["categoria"] === "string") search.categoria = s["categoria"];
    return search;
  },
  head: () => ({
    meta: [
      { title: "Acervo — Painel — BiblioConnect" },
      { name: "description", content: "Pesquise o acervo da biblioteca dentro do seu painel." },
    ],
  }),
  component: PainelCatalogo,
});

function PainelCatalogo() {
  const { q, categoria } = Route.useSearch();
  return (
    <div>
      <PageHeader
        title="Acervo da biblioteca"
        description="Pesquise por título, autor, assunto ou ISBN."
      />
      <DemoNote>
        dados fictícios — a disponibilidade exibida é recalculada a cada empréstimo ou devolução
        registrada.
      </DemoNote>
      <div className="mt-4">
        <Catalog
          key={`${q ?? ""}-${categoria ?? ""}`}
          initialQuery={q ?? ""}
          initialCategory={categoria ?? ""}
          detailBase="/painel/livro/$id"
        />
      </div>
    </div>
  );
}
