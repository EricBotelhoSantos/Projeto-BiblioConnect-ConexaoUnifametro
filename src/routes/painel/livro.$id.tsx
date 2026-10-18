import { createFileRoute } from "@tanstack/react-router";
import { BookDetail } from "@/components/book-detail";

export const Route = createFileRoute("/painel/livro/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes do livro — Painel — BiblioConnect" },
      {
        name: "description",
        content: "Informações bibliográficas, disponibilidade e reserva do título.",
      },
    ],
  }),
  component: PainelLivro,
});

function PainelLivro() {
  const { id } = Route.useParams();
  return (
    <div className="mx-auto max-w-6xl">
      <BookDetail id={id} inPanel />
    </div>
  );
}
