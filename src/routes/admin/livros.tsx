import { createFileRoute } from "@tanstack/react-router";
import { BookOpenText, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/categories";
import { availableCopies } from "@/lib/rules";
import type { Book, Category } from "@/lib/types";
import { deleteBook, saveBook, useDb } from "@/services/library";

export const Route = createFileRoute("/admin/livros")({
  head: () => ({
    meta: [
      { title: "Acervo — Administração — BiblioConnect" },
      { name: "description", content: "Cadastre, edite e exclua títulos do acervo bibliográfico." },
    ],
  }),
  component: AdminLivros,
});

const emptyForm = {
  titulo: "",
  autorId: "",
  categoria: "Tecnologia e Computação" as Category,
  editora: "",
  ano: "",
  isbn: "",
  descricao: "",
  exemplares: "1",
  localizacao: "",
  destaque: false,
};

function AdminLivros() {
  const db = useDb();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [toDelete, setToDelete] = useState<Book | null>(null);

  const set = (k: keyof typeof emptyForm, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const autorNome = (id: string) => db.authors.find((a) => a.id === id)?.nome ?? "—";
  const term = q.trim().toLowerCase();
  const books = db.books.filter(
    (b) =>
      !term ||
      b.titulo.toLowerCase().includes(term) ||
      autorNome(b.autorId).toLowerCase().includes(term) ||
      (b.isbn ?? "").toLowerCase().includes(term),
  );

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (b: Book) => {
    setEditing(b);
    setForm({
      titulo: b.titulo,
      autorId: b.autorId,
      categoria: b.categoria,
      editora: b.editora,
      ano: String(b.ano),
      isbn: b.isbn ?? "",
      descricao: b.descricao,
      exemplares: String(b.exemplares),
      localizacao: b.localizacao,
      destaque: b.destaque ?? false,
    });
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) {
      toast.error("Informe o título.");
      return;
    }
    if (!form.autorId) {
      toast.error("Selecione um autor.");
      return;
    }
    const ano = Number(form.ano);
    if (!Number.isInteger(ano) || ano < 1000 || ano > 2100) {
      toast.error("Informe um ano válido (ex.: 2024).");
      return;
    }
    const exemplares = Number(form.exemplares);
    if (!Number.isInteger(exemplares) || exemplares < 1) {
      toast.error("Informe ao menos 1 exemplar.");
      return;
    }

    const payload: Omit<Book, "id"> & { id?: string } = {
      titulo: form.titulo.trim(),
      autorId: form.autorId,
      categoria: form.categoria,
      editora: form.editora.trim() || "Não informada",
      ano,
      descricao: form.descricao.trim(),
      exemplares,
      localizacao: form.localizacao.trim() || "A definir",
      destaque: form.destaque,
    };
    const isbn = form.isbn.trim();
    if (isbn) payload.isbn = isbn;
    if (editing) payload.id = editing.id;

    const r = saveBook(payload);
    if (r.ok) {
      toast.success(r.message);
      setOpen(false);
    } else toast.error(r.message);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    const r = deleteBook(toDelete.id);
    if (r.ok) toast.success(r.message);
    else toast.error(r.message);
    setToDelete(null);
  };

  return (
    <div>
      <PageHeader
        title="Acervo"
        description="Cadastro bibliográfico completo, com controle de exemplares e integridade referencial."
        actions={
          <Button onClick={openNew}>
            <Plus /> Novo livro
          </Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="busca-livros" className="sr-only">
            Buscar livros
          </label>
          <Input
            id="busca-livros"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título, autor ou ISBN..."
            className="pl-9"
          />
        </div>
      </div>

      {books.length === 0 ? (
        <EmptyState
          icon={BookOpenText}
          title="Nenhum livro encontrado"
          description="Ajuste a busca ou cadastre um novo título no acervo."
          action={
            <Button onClick={openNew}>
              <Plus /> Novo livro
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Livro</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Editora · Ano</TableHead>
                <TableHead className="text-center">Exemplares</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="max-w-[18rem]">
                    <p className="truncate font-semibold">
                      {b.titulo}{" "}
                      {b.destaque && (
                        <span className="text-primary" title="Destaque na página inicial">
                          ★
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{autorNome(b.autorId)}</p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {b.categoria}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {b.editora} · {b.ano}
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge tone={availableCopies(db, b) > 0 ? "success" : "danger"}>
                      {availableCopies(db, b)}/{b.exemplares}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {b.localizacao}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(b)}
                        aria-label={`Editar ${b.titulo}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setToDelete(b)}
                        aria-label={`Excluir ${b.titulo}`}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-6">
        <DemoNote>
          a exclusão é bloqueada quando o título possui empréstimos ou reservas ativas (integridade
          referencial) e a quantidade de exemplares não pode ficar menor que a quantidade
          emprestada.
        </DemoNote>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar livro" : "Cadastrar livro"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Atualize os dados bibliográficos do título."
                : "Inclua um novo título no acervo demonstrativo."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={form.titulo}
                onChange={(e) => set("titulo", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="autor">Autor *</Label>
                <Select value={form.autorId} onValueChange={(v) => set("autorId", v)}>
                  <SelectTrigger id="autor">
                    <SelectValue placeholder="Selecione o autor" />
                  </SelectTrigger>
                  <SelectContent>
                    {db.authors.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={form.categoria}
                  onValueChange={(v) => set("categoria", v as Category)}
                >
                  <SelectTrigger id="categoria">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="editora">Editora</Label>
                <Input
                  id="editora"
                  value={form.editora}
                  onChange={(e) => set("editora", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ano">Ano *</Label>
                <Input
                  id="ano"
                  type="number"
                  min={1000}
                  max={2100}
                  value={form.ano}
                  onChange={(e) => set("ano", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  value={form.isbn}
                  onChange={(e) => set("isbn", e.target.value)}
                  placeholder="978-..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="exemplares">Exemplares *</Label>
                <Input
                  id="exemplares"
                  type="number"
                  min={1}
                  value={form.exemplares}
                  onChange={(e) => set("exemplares", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="localizacao">Localização na estante</Label>
              <Input
                id="localizacao"
                value={form.localizacao}
                onChange={(e) => set("localizacao", e.target.value)}
                placeholder="Estante T-04 · Prateleira 2"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                rows={3}
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                placeholder="Resumo do conteúdo..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="destaque"
                checked={form.destaque}
                onCheckedChange={(v) => set("destaque", v === true)}
              />
              <Label htmlFor="destaque" className="font-normal">
                Exibir na seção “Em destaque” da página inicial
              </Label>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full sm:w-auto">
                {editing ? "Salvar alterações" : "Cadastrar livro"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir livro?</AlertDialogTitle>
            <AlertDialogDescription>
              O título <strong>{toDelete?.titulo ?? ""}</strong> será removido do acervo. A exclusão
              é bloqueada se houver empréstimos ou reservas ativas vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
