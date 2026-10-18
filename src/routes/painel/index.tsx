import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BookMarked,
  Bookmark,
  CalendarClock,
  CircleCheck,
  Clock,
  TriangleAlert,
} from "lucide-react";
import { PageHeader, StatCard, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlerts } from "@/hooks/use-alerts";
import { fmtDate, loanSituation, reservationStatus } from "@/lib/format";
import { isOverdue, toISODate } from "@/lib/rules";
import { useCurrentUser, useDb } from "@/services/library";

export const Route = createFileRoute("/painel/")({
  head: () => ({
    meta: [
      { title: "Meu painel — BiblioConnect" },
      {
        name: "description",
        content: "Resumo dos seus empréstimos, reservas e agendamentos na biblioteca UNIFAMETRO.",
      },
      { property: "og:title", content: "Meu painel — BiblioConnect" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PainelHome,
});

const alertBox: Record<string, string> = {
  danger: "border-destructive/30 bg-danger-soft hover:border-destructive/60",
  warning: "border-warning/30 bg-warning-soft hover:border-warning/60",
  success: "border-success/30 bg-success-soft hover:border-success/60",
};

const alertIcon: Record<string, React.ElementType> = {
  danger: TriangleAlert,
  warning: Clock,
  success: CircleCheck,
};

function PainelHome() {
  const db = useDb();
  const user = useCurrentUser();
  const alerts = useAlerts();

  if (!user) return null;

  const today = toISODate(new Date());
  const titleOf = (id: string) => db.books.find((b) => b.id === id)?.titulo ?? "Livro";
  const roomOf = (id: string) => db.rooms.find((r) => r.id === id)?.nome ?? "Espaço";
  const activeLoans = db.loans
    .filter((l) => l.usuarioId === user.id && !l.dataDevolucao)
    .sort((a, b) => a.dataDevolucaoPrevista.localeCompare(b.dataDevolucaoPrevista));
  const reservations = db.reservations.filter(
    (r) => r.usuarioId === user.id && (r.status === "PENDENTE" || r.status === "DISPONIVEL"),
  );
  const bookings = db.bookings
    .filter((b) => b.usuarioId === user.id && b.status === "CONFIRMADO" && b.data >= today)
    .sort((a, b) => a.data.localeCompare(b.data) || a.horaInicio - b.horaInicio);
  const overdue = activeLoans.filter((l) => isOverdue(l, today));
  const activities = db.activities.filter((a) => a.usuarioId === user.id).slice(0, 6);

  return (
    <div>
      <PageHeader
        title={`Olá, ${user.nome.split(" ")[0]}!`}
        description="Este é o resumo da sua conta na biblioteca."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/painel/catalogo">Consultar acervo</Link>
            </Button>
            <Button asChild>
              <Link to="/painel/espacos">
                <CalendarClock /> Agendar espaço
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookMarked}
          label="Empréstimos ativos"
          value={activeLoans.length}
          hint="Livros em seu nome"
          tone={activeLoans.length ? "primary" : "neutral"}
        />
        <StatCard
          icon={Bookmark}
          label="Reservas ativas"
          value={reservations.length}
          hint="Na fila ou prontas para retirada"
          tone={reservations.length ? "warning" : "neutral"}
        />
        <StatCard
          icon={CalendarClock}
          label="Agendamentos futuros"
          value={bookings.length}
          hint="Espaços de estudo"
          tone={bookings.length ? "info" : "neutral"}
        />
        <StatCard
          icon={TriangleAlert}
          label="Em atraso"
          value={overdue.length}
          hint={overdue.length ? "Regularize no balcão" : "Nenhum atraso"}
          tone={overdue.length ? "danger" : "success"}
        />
      </div>

      {alerts.length > 0 && (
        <div className="mt-6 space-y-2" role="status" aria-label="Avisos da sua conta">
          {alerts.map((a) => {
            const Icon = alertIcon[a.tone] ?? Clock;
            return (
              <Link
                key={a.id}
                to={a.to}
                className={`flex items-start gap-3 rounded-xl border p-4 transition ${alertBox[a.tone] ?? alertBox["warning"]}`}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{a.title}</span>
                  <span className="block text-xs text-muted-foreground">{a.text}</span>
                </span>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 self-center" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Próximas devoluções</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/painel/emprestimos">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activeLoans.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Você não tem empréstimos ativos.{" "}
                <Link to="/painel/catalogo" className="font-medium text-primary hover:underline">
                  Explore o acervo
                </Link>{" "}
                para retirar um livro.
              </p>
            ) : (
              <ul className="divide-y">
                {activeLoans.slice(0, 4).map((l) => {
                  const s = loanSituation(l, today);
                  return (
                    <li
                      key={l.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{titleOf(l.livroId)}</p>
                        <p className="text-xs text-muted-foreground">
                          Devolução prevista: {fmtDate(l.dataDevolucaoPrevista)} · {l.renovacoes}{" "}
                          renovação(ões)
                        </p>
                      </div>
                      <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Reservas ativas</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/painel/reservas">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {reservations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma reserva ativa. Quando todos os exemplares estiverem emprestados, você pode
                entrar na fila.
              </p>
            ) : (
              <ul className="space-y-3">
                {reservations.slice(0, 4).map((r) => {
                  const st = reservationStatus[r.status];
                  return (
                    <li key={r.id} className="flex items-center justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {titleOf(r.livroId)}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          Reservado em {fmtDate(r.criadaEm)}
                        </span>
                      </span>
                      <StatusBadge tone={st.tone}>{st.label}</StatusBadge>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Próximos agendamentos</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/painel/espacos">
                Gerenciar <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum agendamento futuro. Reserve uma sala de estudo sem choque de horários.
              </p>
            ) : (
              <ul className="space-y-3">
                {bookings.slice(0, 4).map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {roomOf(b.salaId)}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {fmtDate(b.data)} · {b.horaInicio}h às {b.horaFim}h
                      </span>
                    </span>
                    <StatusBadge tone="info">Confirmado</StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Atividade recente</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">Suas ações no portal aparecerão aqui.</p>
            ) : (
              <ul className="space-y-3">
                {activities.map((a) => (
                  <li key={a.id} className="flex items-start gap-3">
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm">{a.texto}</span>
                      <span className="block text-xs text-muted-foreground">{fmtDate(a.em)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
