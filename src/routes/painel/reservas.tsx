import { Link, createFileRoute } from "@tanstack/react-router";
import { Bookmark, CalendarClock, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DemoNote, EmptyState, PageHeader, StatusBadge } from "@/components/status-badge";
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
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmtDate, reservationStatus } from "@/lib/format";
import { cancelReservation, useCurrentUser, useDb } from "@/services/library";
import type { Reservation } from "@/lib/types";

export const Route = createFileRoute("/painel/reservas")({
  head: () => ({
    meta: [
      { title: "Minhas reservas — BiblioConnect" },
      {
        name: "description",
        content: "Acompanhe a fila das suas reservas e cancele quando quiser.",
      },
    ],
  }),
  component: PainelReservas,
});

function PainelReservas() {
  const db = useDb();
  const user = useCurrentUser();
  const [toCancel, setToCancel] = useState<Reservation | null>(null);

  if (!user) return null;

  const titleOf = (id: string) => db.books.find((b) => b.id === id)?.titulo ?? "Livro";
  const myReservations = db.reservations
    .filter((r) => r.usuarioId === user.id)
    .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
  const ativas = myReservations.filter((r) => r.status === "PENDENTE" || r.status === "DISPONIVEL");
  const encerradas = myReservations.filter(
    (r) => r.status === "CONCLUIDA" || r.status === "CANCELADA",
  );

  /** Posição do estudante na fila de reservas pendentes do título. */
  const filaPosition = (r: Reservation) =>
    db.reservations
      .filter((x) => x.livroId === r.livroId && x.status === "PENDENTE")
      .sort((a, b) => a.criadaEm.localeCompare(b.criadaEm))
      .findIndex((x) => x.id === r.id) + 1;

  const confirmCancel = () => {
    if (!toCancel) return;
    const res = cancelReservation(toCancel.id);
    if (res.ok) toast.success(res.message);
    else toast.error(res.message);
    setToCancel(null);
  };

  const activeRow = (r: Reservation) => {
    const st = reservationStatus[r.status];
    return (
      <TableRow key={r.id}>
        <TableCell>
          <Link
            to="/painel/livro/$id"
            params={{ id: r.livroId }}
            className="font-semibold hover:text-primary hover:underline"
          >
            {titleOf(r.livroId)}
          </Link>
        </TableCell>
        <TableCell className="whitespace-nowrap text-muted-foreground">
          {fmtDate(r.criadaEm)}
        </TableCell>
        <TableCell>
          {r.status === "PENDENTE" ? (
            <span className="text-sm text-muted-foreground">{filaPosition(r)}º da fila</span>
          ) : (
            <span className="text-sm text-muted-foreground">Retire no balcão</span>
          )}
        </TableCell>
        <TableCell>
          <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
        </TableCell>
        <TableCell className="text-right">
          <Button size="sm" variant="outline" onClick={() => setToCancel(r)}>
            <Trash2 className="h-4 w-4" /> Cancelar
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div>
      <PageHeader
        title="Minhas reservas"
        description="Entre na fila quando todos os exemplares estiverem emprestados e acompanhe a retirada."
        actions={
          <Button asChild variant="outline">
            <Link to="/painel/catalogo">
              <Bookmark /> Reservar outro livro
            </Link>
          </Button>
        }
      />

      {ativas.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nenhuma reserva ativa"
          description="Consulte o acervo e reserve um título quando não houver exemplar disponível."
          action={
            <Button asChild>
              <Link to="/painel/catalogo">Consultar acervo</Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Livro</TableHead>
                <TableHead>Reservado em</TableHead>
                <TableHead>Posição / retirada</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{ativas.map(activeRow)}</TableBody>
          </Table>
        </div>
      )}

      <div className="mt-6 rounded-xl border bg-card shadow-card">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Histórico de reservas</h2>
        </div>
        {encerradas.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">Nenhuma reserva encerrada.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Livro</TableHead>
                <TableHead>Reservado em</TableHead>
                <TableHead>Posição / retirada</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{encerradas.map(activeRow)}</TableBody>
          </Table>
        )}
      </div>

      <div className="mt-6">
        <DemoNote>
          a reserva entra na fila quando não há exemplar disponível. Ao devolver um exemplar, a
          primeira reserva da fila passa a “disponível para retirada” e vale por enquanto não
          confirmada no balcão — cancele se mudar de ideia.
        </DemoNote>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarClock className="h-4 w-4" /> Fila calculada por ordem de criação da reserva.
        </p>
      </div>

      <AlertDialog open={!!toCancel} onOpenChange={(open) => !open && setToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              A reserva de <strong>{toCancel ? titleOf(toCancel.livroId) : ""}</strong> será
              cancelada e você perderá sua posição na fila. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel}>Cancelar reserva</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
