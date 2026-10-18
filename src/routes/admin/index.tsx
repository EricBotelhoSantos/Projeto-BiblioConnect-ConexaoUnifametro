import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BookMarked,
  BookOpenText,
  CalendarClock,
  CircleCheck,
  Clock,
  LibraryBig,
  RotateCcw,
  TriangleAlert,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, StatCard } from "@/components/status-badge";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlerts } from "@/hooks/use-alerts";
import { fmtDate } from "@/lib/format";
import { toISODate } from "@/lib/rules";
import { resetDemo, useDb } from "@/services/library";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Administração — BiblioConnect" },
      {
        name: "description",
        content: "Visão geral do acervo, empréstimos, reservas e agendamentos.",
      },
    ],
  }),
  component: AdminHome,
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

function AdminHome() {
  const db = useDb();
  const alerts = useAlerts();
  const [confirmReset, setConfirmReset] = useState(false);

  const today = toISODate(new Date());
  const activeLoans = db.loans.filter((l) => !l.dataDevolucao);
  const overdue = activeLoans.filter((l) => l.dataDevolucaoPrevista < today);
  const pending = db.reservations.filter((r) => r.status === "PENDENTE");
  const todayBookings = db.bookings.filter((b) => b.status === "CONFIRMADO" && b.data === today);
  const copies = db.books.reduce((sum, b) => sum + b.exemplares, 0);
  const activeUsers = db.users.filter((u) => u.ativo).length;
  const userName = (id: string) => db.users.find((u) => u.id === id)?.nome ?? "Usuário";
  const titleOf = (id: string) => db.books.find((b) => b.id === id)?.titulo ?? "Livro";
  const activities = db.activities.slice(0, 7);

  const doReset = () => {
    resetDemo();
    setConfirmReset(false);
    toast.success("Dados demonstrativos restaurados.");
  };

  return (
    <div>
      <PageHeader
        title="Visão geral"
        description="Acompanhe em tempo real o movimento da biblioteca."
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/admin/livros">
                <BookOpenText /> Gerenciar acervo
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/emprestimos">
                <BookMarked /> Registrar empréstimo
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={LibraryBig}
          label="Títulos no acervo"
          value={db.books.length}
          hint={`${copies} exemplares no total`}
        />
        <StatCard
          icon={BookMarked}
          label="Empréstimos ativos"
          value={activeLoans.length}
          hint="Aguardando devolução"
        />
        <StatCard
          icon={TriangleAlert}
          label="Em atraso"
          value={overdue.length}
          hint={overdue.length ? "Cobrar no balcão" : "Nenhum atraso"}
          tone={overdue.length ? "danger" : "success"}
        />
        <StatCard
          icon={CalendarClock}
          label="Reservas pendentes"
          value={pending.length}
          hint="Aguardando exemplar"
          tone={pending.length ? "warning" : "neutral"}
        />
        <StatCard
          icon={Users}
          label="Usuários ativos"
          value={activeUsers}
          hint={`${db.users.length} contas cadastradas`}
          tone="info"
        />
        <StatCard
          icon={CalendarClock}
          label="Agendamentos hoje"
          value={todayBookings.length}
          hint="Espaços de estudo"
          tone="info"
        />
      </div>

      {alerts.length > 0 && (
        <div className="mt-6 space-y-2" role="status" aria-label="Avisos administrativos">
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
            <CardTitle className="text-base">Atividade recente (todos os usuários)</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
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
                      <span className="block text-xs text-muted-foreground">
                        {userName(a.usuarioId)} · {fmtDate(a.em)} · {a.tipo.toLowerCase()}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">Pendências</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/admin/emprestimos">
                  <TriangleAlert className="text-destructive" /> {overdue.length} empréstimo(s) em
                  atraso
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/admin/reservas">
                  <Clock className="text-warning" /> {pending.length} reserva(s) aguardando fila
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/admin/espacos">
                  <CalendarClock className="text-info" /> {todayBookings.length} agendamento(s) hoje
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Dados demonstrativos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Restaura o protótipo para o estado inicial (livros, empréstimos, reservas e
                agendamentos fictícios).
              </p>
              <Button
                variant="outline"
                className="mt-3 w-full"
                onClick={() => setConfirmReset(true)}
              >
                <RotateCcw /> Restaurar dados
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar dados demonstrativos?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os empréstimos, reservas e agendamentos criados nesta sessão serão descartados e
              o acervo voltará ao estado inicial. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doReset}>Restaurar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
