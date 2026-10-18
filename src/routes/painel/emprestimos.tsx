import { createFileRoute } from "@tanstack/react-router";
import { BookMarked, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DemoNote, EmptyState, PageHeader, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { DEMO_RULES, canRenew, toISODate } from "@/lib/rules";
import { renewLoan, useCurrentUser, useDb } from "@/services/library";

export const Route = createFileRoute("/painel/emprestimos")({
  head: () => ({
    meta: [
      { title: "Meus empréstimos — BiblioConnect" },
      {
        name: "description",
        content: "Acompanhe os prazos dos seus empréstimos e solicite renovações.",
      },
    ],
  }),
  component: PainelEmprestimos,
});

function PainelEmprestimos() {
  const db = useDb();
  const user = useCurrentUser();
  const [q, setQ] = useState("");

  if (!user) return null;

  const today = toISODate(new Date());
  const titleOf = (id: string) => db.books.find((b) => b.id === id)?.titulo ?? "Livro";
  const authorOf = (livroId: string) => {
    const book = db.books.find((b) => b.id === livroId);
    return db.authors.find((a) => a.id === book?.autorId)?.nome ?? "—";
  };

  const mine = db.loans
    .filter((l) => l.usuarioId === user.id)
    .filter((l) => titleOf(l.livroId).toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => b.dataRetirada.localeCompare(a.dataRetirada));
  const ativos = mine
    .filter((l) => !l.dataDevolucao)
    .sort((a, b) => a.dataDevolucaoPrevista.localeCompare(b.dataDevolucaoPrevista));
  const historico = mine.filter((l) => !!l.dataDevolucao);

  const renovar = (loanId: string) => {
    const r = renewLoan(loanId);
    if (r.ok) toast.success(r.message);
    else toast.error(r.message);
  };

  const renderRow = (l: (typeof ativos)[number]) => {
    const s = loanSituation(l, today);
    const check = canRenew(db, l, today);
    return (
      <TableRow key={l.id}>
        <TableCell>
          <p className="font-semibold">{titleOf(l.livroId)}</p>
          <p className="text-xs text-muted-foreground">{authorOf(l.livroId)}</p>
        </TableCell>
        <TableCell className="whitespace-nowrap text-muted-foreground">
          {fmtDate(l.dataRetirada)}
        </TableCell>
        <TableCell className="whitespace-nowrap text-muted-foreground">
          {fmtDate(l.dataDevolucaoPrevista)}
        </TableCell>
        <TableCell className="text-center text-muted-foreground">
          {l.renovacoes}/{DEMO_RULES.maxRenovacoes}
        </TableCell>
        <TableCell>
          <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
        </TableCell>
        <TableCell className="text-right">
          {!l.dataDevolucao && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => renovar(l.id)}
              disabled={!check.ok}
              title={check.ok ? "Solicitar renovação" : check.message}
            >
              <RefreshCw className="h-4 w-4" /> Renovar
            </Button>
          )}
        </TableCell>
      </TableRow>
    );
  };

  const table = (
    <div className="rounded-xl border bg-card shadow-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Livro</TableHead>
            <TableHead>Retirada</TableHead>
            <TableHead>Devolução prevista</TableHead>
            <TableHead className="text-center">Renovações</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{ativos.map(renderRow)}</TableBody>
      </Table>
    </div>
  );

  const historyTable = (
    <div className="rounded-xl border bg-card shadow-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Livro</TableHead>
            <TableHead>Retirada</TableHead>
            <TableHead>Devolução prevista</TableHead>
            <TableHead className="text-center">Renovações</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{historico.map(renderRow)}</TableBody>
      </Table>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Meus empréstimos"
        description="Acompanhe prazos, renovações e o histórico de retiradas."
      />

      <div className="mb-4 max-w-sm">
        <label htmlFor="busca-emprestimos" className="sr-only">
          Filtrar empréstimos por título
        </label>
        <Input
          id="busca-emprestimos"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filtrar por título..."
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
              description="Quando você retirar um livro no balcão, o prazo aparecerá aqui."
            />
          ) : (
            table
          )}
        </TabsContent>
        <TabsContent value="historico" className="mt-4">
          {historico.length === 0 ? (
            <EmptyState
              icon={BookMarked}
              title="Sem histórico de devoluções"
              description="Os livros devolvidos ficarão registrados aqui."
            />
          ) : (
            historyTable
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <DemoNote>
          prazo de {DEMO_RULES.prazoEmprestimoDias} dias por empréstimo, até{" "}
          {DEMO_RULES.maxRenovacoes} renovações de {DEMO_RULES.diasPorRenovacao} dias. Empréstimos
          em atraso ou com fila de reservas não podem ser renovados.
        </DemoNote>
      </div>
    </div>
  );
}
