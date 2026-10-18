import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, CalendarDays, DoorOpen, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DemoNote, EmptyState, PageHeader, StatCard, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { fmtDate } from "@/lib/format";
import { DEMO_RULES, toISODate } from "@/lib/rules";
import { cancelBooking, useDb } from "@/services/library";

export const Route = createFileRoute("/admin/espacos")({
  head: () => ({
    meta: [
      { title: "Agendamentos — Administração — BiblioConnect" },
      { name: "description", content: "Ocupação das salas de estudo e agendamentos confirmados." },
    ],
  }),
  component: AdminEspacos,
});

function AdminEspacos() {
  const db = useDb();
  const today = toISODate(new Date());
  const [data, setData] = useState(today);
  const [salaId, setSalaId] = useState("todas");

  const bookingsOfDate = db.bookings
    .filter((b) => b.data === data)
    .filter((b) => salaId === "todas" || b.salaId === salaId)
    .sort((a, b) => a.horaInicio - b.horaInicio);

  const todayBookings = db.bookings.filter((b) => b.data === today && b.status === "CONFIRMADO");
  const confirmed = db.bookings.filter((b) => b.status === "CONFIRMADO");
  const busyHoursToday = todayBookings.reduce((sum, b) => sum + (b.horaFim - b.horaInicio), 0);
  const capacityHours = db.rooms.length * (DEMO_RULES.horaFechamento - DEMO_RULES.horaAbertura);

  const nameOf = (id: string) => db.users.find((u) => u.id === id)?.nome ?? "—";
  const roomOf = (id: string) => db.rooms.find((r) => r.id === id)?.nome ?? "Espaço";

  const cancelar = (id: string) => {
    const r = cancelBooking(id);
    if (r.ok) toast.success(r.message);
    else toast.error(r.message);
  };

  return (
    <div>
      <PageHeader
        title="Agendamentos de espaços"
        description="Acompanhe a ocupação das salas e cancele reservas quando necessário."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DoorOpen}
          label="Espaços cadastrados"
          value={db.rooms.length}
          hint="Salas e cabines"
        />
        <StatCard
          icon={CalendarClock}
          label="Agendamentos hoje"
          value={todayBookings.length}
          hint={fmtDate(today)}
          tone="info"
        />
        <StatCard
          icon={CalendarDays}
          label="Confirmados (total)"
          value={confirmed.length}
          hint="Inclui datas futuras"
          tone="primary"
        />
        <StatCard
          icon={Users}
          label="Ocupação de hoje"
          value={`${Math.round((busyHoursToday / Math.max(1, capacityHours)) * 100)}%`}
          hint={`${busyHoursToday} de ${capacityHours} horas-livres`}
          tone={busyHoursToday ? "warning" : "neutral"}
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="data-agendamentos">Data</Label>
          <Input
            id="data-agendamentos"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="sm:w-44"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sala-agendamentos">Espaço</Label>
          <Select value={salaId} onValueChange={setSalaId}>
            <SelectTrigger id="sala-agendamentos" className="sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos os espaços</SelectItem>
              {db.rooms.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {data !== today && (
          <Button variant="outline" onClick={() => setData(today)}>
            Voltar para hoje
          </Button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true" />{" "}
          {DEMO_RULES.horaAbertura}h–
          {DEMO_RULES.horaFechamento}h janela de atendimento
        </span>
        <span aria-hidden="true">·</span>
        <span>Máximo de {DEMO_RULES.maxHorasAgendamento} horas por agendamento</span>
      </div>

      <div className="mt-4 rounded-xl border bg-card shadow-card">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">
            Agendamentos de {fmtDate(data)}
            {salaId !== "todas" && ` · ${roomOf(salaId)}`}
          </h2>
        </div>
        {bookingsOfDate.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={CalendarClock}
              title="Nenhum agendamento nesta data"
              description="Todos os horários estão livres para os espaços selecionados."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Espaço</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Estudante</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingsOfDate.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-semibold">{roomOf(b.salaId)}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {b.horaInicio}h às {b.horaFim}h
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{nameOf(b.usuarioId)}</p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge tone={b.status === "CONFIRMADO" ? "info" : "neutral"}>
                      {b.status === "CONFIRMADO" ? "Confirmado" : "Cancelado"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    {b.status === "CONFIRMADO" ? (
                      <Button size="sm" variant="outline" onClick={() => cancelar(b.id)}>
                        <Trash2 className="h-4 w-4" /> Cancelar
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="mt-6">
        <DemoNote>
          horários em conflito nunca chegam a ser gravados — o bloqueio de sobreposição (409
          Conflict) vale para todos os agendamentos do dia.
        </DemoNote>
      </div>
    </div>
  );
}
