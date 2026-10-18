import { createFileRoute } from "@tanstack/react-router";
import { Search, ShieldCheck, UserCheck, UserX, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DemoNote, EmptyState, PageHeader, StatCard, StatusBadge } from "@/components/status-badge";
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
import { initials } from "@/lib/format";
import type { User } from "@/lib/types";
import { toggleUserStatus, useCurrentUser, useDb } from "@/services/library";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários — Administração — BiblioConnect" },
      { name: "description", content: "Contas de acesso da comunidade acadêmica na biblioteca." },
    ],
  }),
  component: AdminUsuarios,
});

function AdminUsuarios() {
  const db = useDb();
  const me = useCurrentUser();
  const [q, setQ] = useState("");
  const [perfil, setPerfil] = useState("todos");
  const [situacao, setSituacao] = useState("todas");
  const [pending, setPending] = useState<User | null>(null);

  const term = q.trim().toLowerCase();
  const users = db.users
    .filter(
      (u) =>
        !term ||
        u.nome.toLowerCase().includes(term) ||
        u.matricula.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.curso.toLowerCase().includes(term),
    )
    .filter(
      (u) =>
        perfil === "todos" || (perfil === "admin" ? u.role === "ADMIN" : u.role === "ESTUDANTE"),
    )
    .filter((u) => situacao === "todas" || (situacao === "ativos" ? u.ativo : !u.ativo));

  const stats = {
    total: db.users.length,
    estudantes: db.users.filter((u) => u.role === "ESTUDANTE").length,
    ativos: db.users.filter((u) => u.ativo).length,
    inativos: db.users.filter((u) => !u.ativo).length,
  };

  const confirmToggle = () => {
    if (!pending) return;
    const r = toggleUserStatus(pending.id);
    if (r.ok) toast.success(r.message);
    else toast.error(r.message);
    setPending(null);
  };

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Contas de estudantes e da equipe da biblioteca no portal."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total de contas"
          value={stats.total}
          hint="Cadastradas no protótipo"
        />
        <StatCard
          icon={ShieldCheck}
          label="Administradores"
          value={db.users.filter((u) => u.role === "ADMIN").length}
          hint="Acesso à administração"
          tone="info"
        />
        <StatCard
          icon={UserCheck}
          label="Contas ativas"
          value={stats.ativos}
          hint="Podem emprestar/reservar"
          tone="success"
        />
        <StatCard
          icon={UserX}
          label="Contas inativas"
          value={stats.inativos}
          hint="Sem acesso aos serviços"
          tone={stats.inativos ? "danger" : "neutral"}
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="max-w-sm flex-1">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <label htmlFor="busca-usuarios" className="sr-only">
              Buscar usuários
            </label>
            <Input
              id="busca-usuarios"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, matrícula, e-mail ou curso..."
              className="pl-9"
            />
          </div>
        </div>
        <Select value={perfil} onValueChange={setPerfil}>
          <SelectTrigger aria-label="Filtrar por perfil" className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os perfis</SelectItem>
            <SelectItem value="estudante">Estudantes</SelectItem>
            <SelectItem value="admin">Administradores</SelectItem>
          </SelectContent>
        </Select>
        <Select value={situacao} onValueChange={setSituacao}>
          <SelectTrigger aria-label="Filtrar por situação" className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as situações</SelectItem>
            <SelectItem value="ativos">Ativas</SelectItem>
            <SelectItem value="inativos">Inativas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="my-4 text-sm text-muted-foreground" aria-live="polite">
        {users.length} conta(s)
      </p>

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhuma conta encontrada"
          description="Ajuste os filtros aplicados."
        />
      ) : (
        <div className="rounded-xl border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudante</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isAdmin = u.role === "ADMIN";
                const isMe = me?.id === u.id;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-ink-foreground">
                          {initials(u.nome)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{u.nome}</p>
                          <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-sm text-muted-foreground">
                      {u.matricula}
                    </TableCell>
                    <TableCell className="max-w-[12rem]">
                      <p className="truncate text-sm text-muted-foreground">{u.curso}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={isAdmin ? "primary" : "info"}>
                        {isAdmin ? "Admin" : "Estudante"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge tone={u.ativo ? "success" : "danger"}>
                        {u.ativo ? "Ativa" : "Inativa"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isAdmin ? (
                        <span
                          className="text-xs text-muted-foreground"
                          title="A conta administrativa não pode ser desativada"
                        >
                          Protegida
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isMe}
                          title={isMe ? "Você não pode desativar sua própria conta" : undefined}
                          onClick={() => setPending(u)}
                        >
                          {u.ativo ? (
                            <>
                              <UserX className="h-4 w-4" /> Desativar
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4" /> Reativar
                            </>
                          )}
                        </Button>
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
          contas e senhas são fictícias. Usuários inativos não podem realizar empréstimos, reservas
          ou agendamentos.
        </DemoNote>
      </div>

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.ativo ? "Desativar conta?" : "Reativar conta?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.ativo ? (
                <>
                  A conta de <strong>{pending?.nome ?? ""}</strong> ficará inativa e não poderá
                  realizar novos empréstimos, reservas ou agendamentos.
                </>
              ) : (
                <>
                  A conta de <strong>{pending?.nome ?? ""}</strong> voltará a ter acesso aos
                  serviços da biblioteca.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggle}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
