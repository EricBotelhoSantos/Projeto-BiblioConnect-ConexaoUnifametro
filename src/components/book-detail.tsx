import { Link } from "@tanstack/react-router";
import { ArrowLeft, BookmarkPlus, CheckCircle2, Info, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BookCover } from "./book-cover";
import { EmptyState, StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { availableCopies, canReserve } from "@/lib/rules";
import { reserveBook, useCurrentUser, useDb } from "@/services/library";

export function BookDetail({ id, inPanel }: { id: string; inPanel?: boolean }) {
  const db = useDb();
  const user = useCurrentUser();
  const [confirm, setConfirm] = useState(false);
  const book = db.books.find((b) => b.id === id);
  const back = inPanel ? "/painel/catalogo" : "/catalogo";

  if (!book)
    return (
      <EmptyState
        icon={Info}
        title="Livro não encontrado"
        description="O título pode ter sido removido do acervo demonstrativo."
        action={
          <Button asChild variant="outline">
            <Link to={back}>Voltar ao acervo</Link>
          </Button>
        }
      />
    );

  const autor = db.authors.find((a) => a.id === book.autorId)?.nome ?? "—";
  const avail = availableCopies(db, book);
  const myRes =
    user &&
    db.reservations.find(
      (r) =>
        r.livroId === book.id &&
        r.usuarioId === user.id &&
        (r.status === "PENDENTE" || r.status === "DISPONIVEL"),
    );
  const myLoan =
    user &&
    db.loans.find((l) => l.livroId === book.id && l.usuarioId === user.id && !l.dataDevolucao);
  const fila = db.reservations.filter(
    (r) => r.livroId === book.id && r.status === "PENDENTE",
  ).length;
  const check = user ? canReserve(db, user.id, book) : null;

  const doReserve = () => {
    if (!user) return;
    const r = reserveBook(user.id, book.id);
    if (r.ok) toast.success(r.message);
    else toast.error(r.message);
    setConfirm(false);
  };

  const info: [string, string][] = [
    ["Autor", autor],
    ["Editora", book.editora],
    ["Ano", String(book.ano)],
    ["ISBN", book.isbn ?? "Não informado"],
    ["Categoria", book.categoria],
    ["Exemplares", `${book.exemplares} no acervo`],
  ];

  return (
    <div>
      <Link
        to={back}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao acervo
      </Link>
      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <BookCover book={book} author={autor} size="lg" className="mx-auto w-56 md:w-full" />
        <div>
          <p className="text-sm font-semibold text-primary">{book.categoria}</p>
          <h1 className="mt-1 text-3xl font-bold">{book.titulo}</h1>
          <p className="mt-1 text-lg text-muted-foreground">{autor}</p>
          <p className="mt-4 max-w-2xl leading-relaxed">{book.descricao}</p>

          <dl className="mt-6 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-3 rounded-xl border bg-card p-5 sm:grid-cols-3">
            {info.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 max-w-2xl rounded-xl border bg-card p-5">
            <div className="flex flex-wrap items-center gap-3">
              {avail > 0 ? (
                <StatusBadge tone="success">Disponível · {avail} exemplar(es)</StatusBadge>
              ) : (
                <StatusBadge tone="danger">Emprestado</StatusBadge>
              )}
              {fila > 0 && <StatusBadge tone="warning">{fila} reserva(s) na fila</StatusBadge>}
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {book.localizacao} (ilustrativa)
              </span>
            </div>

            <div className="mt-4">
              {myLoan ? (
                <p className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success" /> Você está com este livro.
                </p>
              ) : myRes ? (
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge tone={myRes.status === "DISPONIVEL" ? "success" : "info"}>
                    {myRes.status === "DISPONIVEL"
                      ? "Reserva disponível para retirada"
                      : "Reserva pendente"}
                  </StatusBadge>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/painel/reservas">Ver minhas reservas</Link>
                  </Button>
                </div>
              ) : avail > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Exemplar disponível para retirada imediata no balcão da biblioteca. A reserva fica
                  habilitada quando todos os exemplares estão emprestados.
                </p>
              ) : !user ? (
                <Button asChild>
                  <Link to="/login">
                    <BookmarkPlus /> Entrar para reservar
                  </Link>
                </Button>
              ) : user.role === "ADMIN" ? (
                <p className="text-sm text-muted-foreground">
                  Reservas são feitas pelo perfil de estudante.
                </p>
              ) : (
                <Button onClick={() => setConfirm(true)} disabled={!check?.ok}>
                  <BookmarkPlus /> Reservar livro
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar reserva</AlertDialogTitle>
            <AlertDialogDescription>
              Reservar <strong>{book.titulo}</strong> em nome de {user?.nome} (matrícula{" "}
              {user?.matricula}). Você entrará na fila e será avisado quando um exemplar for
              devolvido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doReserve}>Confirmar reserva</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
