import { createFileRoute } from "@tanstack/react-router";
import { BookMarked, Plus, Undo2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DemoNote, EmptyState, PageHeader, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fmtDate, loanSituation } from "@/lib/format";
import { availableCopies, toISODate } from "@/lib/rules";
import { registerLoan, registerReturn, useDb } from "@/services/library";

export const Route = createFileRoute("/admin/emprestimos")({
  head: () => ({
    meta: [
      { title: "Empréstimos — Administração — BiblioConnect" },
      { name: "description", content: "Registre empréstimos e devoluções e acompanhe os prazos." },
    ],
  }),
  component: AdminEmprestimos,
});

function AdminEmprestimos() {
  const db = useDb();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [bookId, setBookId] = useState("");
  const today = toISODate(new Date());

  const users = db.users.filter((u) => u.role === "ESTUDANTE" && u.ativo);
  const books = db.books.filter((b) => availableCopies(db, b) > 0);
  const selectedUser = users.find((u) => u.id === userId);
  const selectedBook = db.books.find((b) => b.id === bookId);

  const nameOf = (id: string) => db.users.find((u) => u.id === id)?.nome ?? "—";
  const matOf = (id: string) => db.users.find((u) => u.id === id)?.matricula ?? "—";
  const titleOf = (id: string) => db.books.find((b) => b.id === id)?.titulo ?? "Livro";

  const term = q.trim().toLowerCase();
  const match = (usuarioId: string, livroId: string) =>
    !term ||
    nameOf(usuarioId).toLowerCase().includes(term) ||
    titleOf(livroId).toLowerCase().includes(term);

  const ativos = db.loans
    .filter((l) => !l.dataDevolucao && match(l.usuarioId, l.livroId))
    .sort((a, b) => a.dataDevolucaoPrevista.localeCompare(b.dataDevolucaoPrevista));
  const historico = db.loans
    .filter((l) => !!l.dataDevolucao && match(l.usuarioId, l.livroId))
    .sort((a, b) => (b.dataDevolucao ?? "").localeCompare(a.dataDevolucao ?? ""));

  const emprestar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !bookId) {
      toast.error("Selecione o estudante e o livro.");
      return;
    }
    const r = registerLoan(userId, bookId);
    if (r.ok) {
      toast.success(r.message);
      setOpen(false);
      setUserId("");
      setBookId("");
    } else toast.error(r.message);
  };

  const devolver = (loanId: string) => {
    const r = registerReturn(loanId);
    if (r.ok) toast.success(r.message);
    else toast.error(r.message);
  };

  const rows = (list: typeof ativos, showReturn: boolean) => (
    <div className="rounded-xl border bg-card shadow-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Estudante</TableHead>
            <TableHead>Livro</TableHead>
            <TableHead>Retirada</TableHead>
            <TableHead>Previsão</TableHead>
            <TableHead className="text-center">Renov.</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((l) => {
            const s = loanSituation(l, today);
            return (
              <TableRow key={l.id}>
                <TableCell>
                  <p className="font-medium">{nameOf(l.usuarioId)}</p>
                  <p className="text-xs text-muted-foreground">Matrícula {matOf(l.usuarioId)}</p>
                </TableCell>
                <TableCell className="max-w-[16rem]">
                  <p className="truncate font-semibold">{titleOf(l.livroId)}</p>
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {fmtDate(l.dataRetirada)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {fmtDate(l.dataDevolucaoPrevista)}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">{l.renovacoes}</TableCell>
                <TableCell>
                  <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                </TableCell>
                <TableCell className="text-right">
                  {showReturn ? (
                    <Button size="sm" variant="outline" onClick={() => devolver(l.id)}>
                      <Undo2 className="h-4 w-4" /> Devolver
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
  );

  return (
    <div>
      <PageHeader
        title="Empréstimos"
        description="Registre a retirada de exemplares no balcão e acompanhe devoluções."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus /> Registrar empréstimo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar empréstimo</DialogTitle>
                <DialogDescription>
                  A retirada é física no balcão — aqui você registra o movimento para controle de
                  prazo.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={emprestar} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="estudante">Estudante</Label>
                  <Select value={userId} onValueChange={setUserId}>
                    <SelectTrigger id="estudante">
                      <SelectValue placeholder="Selecione o estudante" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.nome} · {u.matricula}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="livro">Livro</Label>
                  <Select value={bookId} onValueChange={setBookId}>
                    <SelectTrigger id="livro">
                      <SelectValue placeholder="Selecione o livro disponível" />
                    </SelectTrigger>
                    <SelectContent>
                      {books.length === 0 ? (
                        <SelectItem value="none" disabled>
                          Nenhum exemplar disponível
                        </SelectItem>
                      ) : (
                        books.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.titulo} · {availableCopies(db, b)} disp.
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedUser && selectedBook && (
                  <div className="rounded-lg border bg-muted p-3 text-sm">
                    <p>
                      <span className="font-semibold">{selectedUser.nome}</span> retirará{" "}
                      <span className="font-semibold">{selectedBook.titulo}</span>.
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Padrão demonstrativo: 14 dias de prazo, com até 2 renovações de 7 dias.
                    </p>
                  </div>
                )}

                <DialogFooter>
                  <Button type="submit" className="w-full sm:w-auto">
                    <BookMarked /> Confirmar empréstimo
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4 max-w-sm">
        <label htmlFor="busca-admin-emprestimos" className="sr-only">
          Buscar empréstimos
        </label>
        <Input
          id="busca-admin-emprestimos"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por estudante ou título..."
        />
      </div>

      <Tabs defaultValue="ativos">
        <TabsList>
          <TabsTrigger value="ativos">Em aberto ({ativos.length})</TabsTrigger>
          <TabsTrigger value="historico">Histórico ({historico.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="ativos" className="mt-4">
          {ativos.length === 0 ? (
            <EmptyState
              icon={BookMarked}
              title="Nenhum empréstimo em aberto"
              description="Registre uma retirada para começar a controlar os prazos."
            />
          ) : (
            rows(ativos, true)
          )}
        </TabsContent>
        <TabsContent value="historico" className="mt-4">
          {historico.length === 0 ? (
            <EmptyState
              icon={BookMarked}
              title="Sem histórico"
              description="As devoluções registradas aparecem aqui."
            />
          ) : (
            rows(historico, false)
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <DemoNote>
          a devolução libera a cópia no acervo e, se houver fila, a primeira reserva pendente passa
          a “disponível para retirada” automaticamente.
        </DemoNote>
      </div>
    </div>
  );
}
