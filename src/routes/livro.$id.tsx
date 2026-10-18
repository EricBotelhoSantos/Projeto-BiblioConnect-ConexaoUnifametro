import { createFileRoute } from "@tanstack/react-router";
import { BookDetail } from "@/components/book-detail";
import { PublicLayout } from "@/components/public-layout";

export const Route = createFileRoute("/livro/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes do livro — BiblioConnect" },
      {
        name: "description",
        content: "Informações bibliográficas, disponibilidade e reserva do título.",
      },
      { property: "og:title", content: "Detalhes do livro — BiblioConnect" },
      { property: "og:description", content: "Disponibilidade e reserva no acervo demonstrativo." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <BookDetail id={id} />
      </div>
    </PublicLayout>
  );
}
