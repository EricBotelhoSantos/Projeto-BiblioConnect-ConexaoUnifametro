import { createFileRoute } from "@tanstack/react-router";
import {
  BookMarked,
  Bookmark,
  CalendarClock,
  History,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { DemoNote, PageHeader, StatCard, StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtDate, initials } from "@/lib/format";
import { useCurrentUser, useDb } from "@/services/library";

export const Route = createFileRoute("/painel/perfil")({
  head: () => ({
    meta: [
      { title: "Meu perfil — BiblioConnect" },
      { name: "description", content: "Dados da sua conta acadêmica na biblioteca." },
    ],
  }),
  component: PainelPerfil,
});

function PainelPerfil() {
  const db = useDb();
  const user = useCurrentUser();

  if (!user) return null;

  const loans = db.loans.filter((l) => l.usuarioId === user.id);
  const reservations = db.reservations.filter((r) => r.usuarioId === user.id);
  const bookings = db.bookings.filter((b) => b.usuarioId === user.id && b.status === "CONFIRMADO");
  const activities = db.activities.filter((a) => a.usuarioId === user.id);

  const dados: [string, string][] = [
    ["Nome completo", user.nome],
    ["Matrícula", user.matricula],
    ["E-mail", user.email],
    ["Curso", user.curso],
    ["Período", user.periodo ?? "—"],
    ["Perfil de acesso", user.role === "ADMIN" ? "Administrador" : "Estudante"],
  ];

  return (
    <div>
      <PageHeader title="Meu perfil" description="Dados da sua conta acadêmica no BiblioConnect." />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink font-display text-2xl font-bold text-ink-foreground">
                {initials(user.nome)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-bold">{user.nome}</p>
                <p className="text-sm text-muted-foreground">Matrícula {user.matricula}</p>
                <div className="mt-2">
                  <StatusBadge tone={user.ativo ? "success" : "danger"}>
                    {user.ativo ? "Conta ativa" : "Conta inativa"}
                  </StatusBadge>
                </div>
              </div>
            </div>

            <dl className="mt-6 space-y-3">
              {dados.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
                  <dd className="break-all text-right text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              Protótipo demonstrativo: nenhum dado pessoal real é armazenado — a senha exibida no
              login é fictícia.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-5 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              icon={BookMarked}
              label="Empréstimos"
              value={loans.length}
              hint="Registrados em seu nome"
            />
            <StatCard
              icon={Bookmark}
              label="Reservas"
              value={reservations.length}
              hint="Inclui encerradas"
              tone="warning"
            />
            <StatCard
              icon={CalendarClock}
              label="Agendamentos"
              value={bookings.length}
              hint="Salas confirmadas"
              tone="info"
            />
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4 text-primary" aria-hidden="true" /> Atividade da conta
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma ação registrada ainda.</p>
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
                          {fmtDate(a.em)} · {a.tipo.toLowerCase()}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-wrap items-center gap-4 pt-6">
              <span className="rounded-lg bg-primary-soft p-2 text-primary">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold">Precisa atualizar seus dados?</h2>
                <p className="text-sm text-muted-foreground">
                  Alterações de matrícula, e-mail ou período são feitas na secretaria acadêmica e
                  propagadas para a biblioteca.
                </p>
              </div>
              <UserRound className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <DemoNote>
          contas, senhas e histórico são fictícios e existem apenas para demonstrar o fluxo do
          portal.
        </DemoNote>
      </div>
    </div>
  );
}
