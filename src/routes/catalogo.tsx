import { createFileRoute } from "@tanstack/react-router";
import { Catalog } from "@/components/catalog";
import { PublicLayout } from "@/components/public-layout";

export const Route = createFileRoute("/catalogo")({
  validateSearch: (s: Record<string, unknown>): { q?: string; categoria?: string } => {
    const search: { q?: string; categoria?: string } = {};
    if (typeof s["q"] === "string") search.q = s["q"];
    if (typeof s["categoria"] === "string") search.categoria = s["categoria"];
    return search;
  },
  head: () => ({
    meta: [
      { title: "Acervo — BiblioConnect" },
      {
        name: "description",
        content:
          "Pesquise livros por título, autor, assunto ou ISBN e veja a disponibilidade de exemplares.",
      },
      { property: "og:title", content: "Acervo — BiblioConnect" },
      {
        property: "og:description",
        content: "Pesquise o acervo demonstrativo da biblioteca UNIFAMETRO.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const { q, categoria } = Route.useSearch();
  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold">Consulta ao acervo</h1>
        <p className="mb-6 mt-1 text-muted-foreground">Acervo demonstrativo com dados fictícios.</p>
        <Catalog
          key={`${q}-${categoria}`}
          initialQuery={q}
          initialCategory={categoria}
          detailBase="/livro/$id"
        />
      </div>
    </PublicLayout>
  );
}
