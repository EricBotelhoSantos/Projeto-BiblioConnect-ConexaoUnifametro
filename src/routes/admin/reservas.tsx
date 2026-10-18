import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DemoNote, EmptyState, PageHeader, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmtDate, reservationStatus } from "@/lib/format";
import { availableCopies } from "@/lib/rules";
import type { ReservationStatus } from "@/lib/types";
import { confirmReservation, useDb } from "@/services/library";

export const Route = createFileRoute("/admin/reservas")({
  head: () => ({
    meta: [
      { title: "Reservas — Administração — BiblioConnect" },
      {
        name: "description",
        content: "Fila de reservas: libere exemplares devolvidos para retirada.",
      },
    ],
  }),
  component: AdminReservas,
});

const FILTERS: { value: "TODAS" | ReservationStatus; label: string }[] = [
  { value: "TODAS", label: "Todas as situações" },
  { value: "PENDENTE", label: "Na fila (pendente)" },
  { value: "DISPONIVEL", label: "Disponível para retirada" },
  { value: "CONCLUIDA", label: "Concluída" },
  { value: "CANCELADA", label: "Cancelada" },
];

function AdminReservas() {
  const db = useDb();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("TODAS");

  const nameOf = (id: string) => db.users.find((u) => u.id === id)?.nome ?? "—";
  const titleOf = (id: string) => db.books.find((b) => b.id === id)?.titulo ?? "Livro";

  const term = q.trim().toLowerCase();
  const all = db.reservations
    .filter((r) => filter === "TODAS" || r.status === filter)
    .filter(
      (r) =>
        !term ||
        nameOf(r.usuarioId).toLowerCase().includes(term) ||
        titleOf(r.livroId).toLowerCase().includes(term),
    )
    .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));

  const counts = {
    PENDENTE: db.reservations.filter((r) => r.status === "PENDENTE").length,
    DISPONIVEL: db.reservations.filter((r) => r.status === "DISPONIVEL").length,
    CONCLUIDA: db.reservations.filter((r) => r.status === "CONCLUIDA").length,
    CANCELADA: db.reservations.filter((r) => r.status === "CANCELADA").length,
  };

  const filaPosition = (r: (typeof all)[number]) =>
    db.reservations
      .filter((x) => x.livroId === r.livroId && x.status === "PENDENTE")
      .sort((a, b) => a.criadaEm.localeCompare(b.criadaEm))
      .findIndex((x) => x.id === r.id) + 1;

  const liberar = (id: string) => {
    const r = confirmReservation(id);
    if (r.ok) toast.success(r.message);
    else toast.error(r.message);
  };

  return (
    <div>
      <PageHeader
        title="Fila de reservas"
        description="Libere para retirada os exemplares devolvidos e acompanhe a ordem de espera."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FILTERS.slice(1).map((f) => {
          const tone =
            f.value === "PENDENTE" ? "warning" : f.value === "DISPONIVEL" ? "success" : "neutral";
          const count = f.value === "TODAS" ? 0 : counts[f.value];
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`rounded-xl border bg-card p-4 text-left shadow-card transition hover:border-primary ${
                filter === f.value ? "border-primary ring-2 ring-primary/25" : ""
              }`}
            >
              <StatusBadge tone={tone}>{count}</StatusBadge>
              <p className="mt-2 text-sm font-semibold">{f.label}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="max-w-sm flex-1">
          <label htmlFor="busca-reservas" className="sr-only">
            Buscar reservas
          </label>
          <Input
            id="busca-reservas"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por estudante ou título..."
          />
        </div>
        <Select
          value={filter}
          onValueChange={(v) => setFilter(v as (typeof FILTERS)[number]["value"])}
        >
          <SelectTrigger aria-label="Filtrar por situação" className="sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="my-4 text-sm text-muted-foreground" aria-live="polite">
        {all.length} reserva(s)
      </p>

      {all.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nenhuma reserva encontrada"
          description="Quando um estudante reservar um título sem exemplares disponíveis, ele aparecerá aqui."
        />
      ) : (
        <div className="rounded-xl border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudante</TableHead>
                <TableHead>Livro</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead>Fila</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {all.map((r) => {
                const st = reservationStatus[r.status];
                const book = db.books.find((b) => b.id === r.livroId);
                const podeLiberar =
                  r.status === "PENDENTE" && book ? availableCopies(db, book) > 0 : false;
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <p className="font-medium">{nameOf(r.usuarioId)}</p>
                    </TableCell>
                    <TableCell className="max-w-[16rem]">
                      <p className="truncate font-semibold">{titleOf(r.livroId)}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {fmtDate(r.criadaEm)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.status === "PENDENTE" ? `${filaPosition(r)}º` : "—"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      {r.status === "PENDENTE" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => liberar(r.id)}
                          disabled={!podeLiberar}
                          title={
                            podeLiberar
                              ? "Liberar exemplar para retirada"
                              : "Nenhum exemplar devolvido disponível ainda"
                          }
                        >
                          <BookmarkCheck className="h-4 w-4" /> Liberar
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-6">
        <DemoNote>
          a liberação manual existe porque a cópia só entra na reserva quando é devolvida — o botão
          “Liberar” fica disponível enquanto houver exemplar livre para o título.
        </DemoNote>
      </div>
    </div>
  );
}
