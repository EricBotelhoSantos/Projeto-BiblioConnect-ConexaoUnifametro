import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, CircleCheck, MapPin, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DemoNote, EmptyState, PageHeader, StatusBadge } from "@/components/status-badge";
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
import { fmtDate } from "@/lib/format";
import { DEMO_RULES, hasConflict, toISODate } from "@/lib/rules";
import { bookRoom, cancelBooking, useCurrentUser, useDb } from "@/services/library";

export const Route = createFileRoute("/painel/espacos")({
  head: () => ({
    meta: [
      { title: "Espaços de estudo — BiblioConnect" },
      {
        name: "description",
        content: "Agende salas e cabines de estudo sem conflito de horários.",
      },
    ],
  }),
  component: PainelEspacos,
});

const HOURS = Array.from(
  { length: DEMO_RULES.horaFechamento - DEMO_RULES.horaAbertura },
  (_, i) => DEMO_RULES.horaAbertura + i,
);

function PainelEspacos() {
  const db = useDb();
  const user = useCurrentUser();
  const today = toISODate(new Date());

  const [salaId, setSalaId] = useState(db.rooms[0]?.id ?? "");
  const [data, setData] = useState(today);
  const [selInicio, setSelInicio] = useState(9);
  const [selFim, setSelFim] = useState(11);

  if (!user) return null;

  const busy = (h: number) => hasConflict(db.bookings, salaId, data, h, h + 1);
  const rangeBusy = (de: number, ate: number) =>
    HOURS.filter((h) => h >= de && h < ate).some((h) => busy(h));

  // Horários derivados: se a seleção ficou ocupada (outra sala/data), o valor
  // exibido é corrigido automaticamente para o primeiro intervalo livre.
  const startOptions = HOURS.filter((h) => h < DEMO_RULES.horaFechamento && !busy(h));
  const inicio = startOptions.includes(selInicio)
    ? selInicio
    : (startOptions[0] ?? DEMO_RULES.horaAbertura);
  const fimMax = Math.min(inicio + DEMO_RULES.maxHorasAgendamento, DEMO_RULES.horaFechamento);
  const fimOptions = Array.from({ length: fimMax - inicio }, (_, i) => inicio + i + 1).filter(
    (e) => !rangeBusy(inicio, e),
  );
  const fim = fimOptions.includes(selFim) ? selFim : (fimOptions[0] ?? inicio + 1);

  const myBookings = db.bookings
    .filter((b) => b.usuarioId === user.id)
    .sort((a, b) => b.data.localeCompare(a.data) || b.horaInicio - a.horaInicio);
  const upcoming = myBookings.filter((b) => b.status === "CONFIRMADO" && b.data >= today);
  const others = myBookings.filter((b) => !(b.status === "CONFIRMADO" && b.data >= today));

  const agendar = (e: React.FormEvent) => {
    e.preventDefault();
    const r = bookRoom(user.id, salaId, data, inicio, fim);
    if (r.ok) toast.success(r.message);
    else toast.error(r.message);
  };

  const cancelar = (id: string) => {
    const r = cancelBooking(id);
    if (r.ok) toast.success(r.message);
    else toast.error(r.message);
  };

  const roomName = (id: string) => db.rooms.find((r) => r.id === id)?.nome ?? "Espaço";

  const bookingRow = (b: (typeof myBookings)[number], showCancel: boolean) => (
    <li
      key={b.id}
      className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold">{roomName(b.salaId)}</p>
        <p className="text-xs text-muted-foreground">
          {fmtDate(b.data)} · {b.horaInicio}h às {b.horaFim}h
        </p>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge tone={b.status === "CONFIRMADO" ? "info" : "neutral"}>
          {b.status === "CONFIRMADO" ? "Confirmado" : "Cancelado"}
        </StatusBadge>
        {showCancel && (
          <Button size="sm" variant="outline" onClick={() => cancelar(b.id)}>
            <Trash2 className="h-4 w-4" /> Cancelar
          </Button>
        )}
      </div>
    </li>
  );

  return (
    <div>
      <PageHeader
        title="Espaços de estudo"
        description="Escolha o espaço, a data e o horário — conflitos são bloqueados automaticamente."
      />
      <DemoNote>
        atendimento das {DEMO_RULES.horaAbertura}h às {DEMO_RULES.horaFechamento}h, blocos de 1 a{" "}
        {DEMO_RULES.maxHorasAgendamento} horas. Ao colidir com outro agendamento, o sistema responde
        409 Conflict e o horário é liberado para outra pessoa.
      </DemoNote>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-semibold">1. Escolha o espaço</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {db.rooms.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSalaId(r.id)}
                aria-pressed={salaId === r.id}
                className={cn(
                  "rounded-xl border bg-card p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:border-primary",
                  salaId === r.id && "border-primary ring-2 ring-primary/25",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{r.nome}</span>
                  {salaId === r.id && (
                    <CircleCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  )}
                </div>
                <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> {r.capacidade} lugar(es)
                </span>
                <span className="mt-2 flex flex-wrap gap-1">
                  {r.recursos.map((rec) => (
                    <span
                      key={rec}
                      className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {rec}
                    </span>
                  ))}
                </span>
              </button>
            ))}
          </div>

          <h2 className="mb-3 mt-6 font-semibold">2. Escolha data e horário</h2>
          <form onSubmit={agendar} className="rounded-xl border bg-card p-4 shadow-card">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  min={today}
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="inicio">Início</Label>
                <Select
                  value={String(inicio)}
                  onValueChange={(v) => {
                    setSelInicio(Number(v));
                    setSelFim(Math.min(Number(v) + 2, DEMO_RULES.horaFechamento));
                  }}
                >
                  <SelectTrigger id="inicio">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.slice(0, -1).map((h) => (
                      <SelectItem key={h} value={String(h)} disabled={busy(h)}>
                        {h}h {busy(h) ? "· ocupado" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fim">Fim</Label>
                <Select value={String(fim)} onValueChange={(v) => setSelFim(Number(v))}>
                  <SelectTrigger id="fim">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: DEMO_RULES.horaFechamento - DEMO_RULES.horaAbertura - 1 },
                      (_, i) => DEMO_RULES.horaAbertura + i + 1,
                    ).map((h) => (
                      <SelectItem
                        key={h}
                        value={String(h)}
                        disabled={h <= inicio || rangeBusy(inicio, h)}
                      >
                        {h}h
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {salaId
                  ? `${roomName(salaId)} · ${fmtDate(data)} · das ${inicio}h às ${fim}h (${fim - inicio}h)`
                  : "Selecione um espaço."}
              </p>
              <Button type="submit" disabled={!salaId || fimOptions.length === 0}>
                <CalendarClock /> Agendar
              </Button>
            </div>

            {/* Ocupação do dia para o espaço selecionado */}
            <div className="mt-4 border-t pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ocupação em {fmtDate(data)}
              </p>
              <div
                className="flex flex-wrap gap-1.5"
                role="list"
                aria-label="Faixas horárias ocupadas"
              >
                {HOURS.map((h) => (
                  <span
                    key={h}
                    role="listitem"
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-medium",
                      busy(h) ? "bg-danger-soft text-destructive" : "bg-success-soft text-success",
                    )}
                    title={busy(h) ? `${h}h–${h + 1}h ocupado` : `${h}h–${h + 1}h livre`}
                  >
                    {h}h
                  </span>
                ))}
              </div>
            </div>
          </form>
        </div>

        <div>
          <h2 className="mb-3 font-semibold">Meus agendamentos</h2>
          <div className="rounded-xl border bg-card p-4 shadow-card">
            {myBookings.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="Nenhum agendamento"
                description="Reserve um espaço para estudar individualmente ou em grupo."
              />
            ) : (
              <>
                <ul className="divide-y">{upcoming.map((b) => bookingRow(b, true))}</ul>
                {others.length > 0 && (
                  <>
                    <p className="mt-4 border-t pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Anteriores / cancelados
                    </p>
                    <ul className="divide-y">{others.map((b) => bookingRow(b, false))}</ul>
                  </>
                )}
              </>
            )}
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            Salas localizadas na biblioteca UNIFAMETRO. Apresente-se no balcão 10 minutos antes do
            horário.
          </p>
        </div>
      </div>
    </div>
  );
}
