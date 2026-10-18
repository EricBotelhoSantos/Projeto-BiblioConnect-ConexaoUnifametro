import { createFileRoute } from "@tanstack/react-router";
import { BookCopy, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Author } from "@/lib/types";
import { deleteAuthor, saveAuthor, useDb } from "@/services/library";

export const Route = createFileRoute("/admin/autores")({
  head: () => ({
    meta: [
      { title: "Autores — Administração — BiblioConnect" },
      { name: "description", content: "Cadastro de autores e vínculo com os títulos do acervo." },
    ],
  }),
  component: AdminAutores,
});

function AdminAutores() {
  const db = useDb();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Author | null>(null);
  const [nome, setNome] = useState("");
  const [nacionalidade, setNacionalidade] = useState("");
  const [toDelete, setToDelete] = useState<Author | null>(null);

  const term = q.trim().toLowerCase();
  const authors = db.authors
    .filter(
      (a) =>
        !term ||
        a.nome.toLowerCase().includes(term) ||
        a.nacionalidade.toLowerCase().includes(term),
    )
    .map((a) => ({ ...a, livros: db.books.filter((b) => b.autorId === a.id).length }))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const openNew = () => {
    setEditing(null);
    setNome("");
    setNacionalidade("");
    setOpen(true);
  };

  const openEdit = (a: Author) => {
    setEditing(a);
    setNome(a.nome);
    setNacionalidade(a.nacionalidade);
    setOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Informe o nome do autor.");
      return;
    }
    if (!nacionalidade.trim()) {
      toast.error("Informe a nacionalidade.");
      return;
    }
    const payload: Omit<Author, "id"> & { id?: string } = {
      nome: nome.trim(),
      nacionalidade: nacionalidade.trim(),
    };
    if (editing) payload.id = editing.id;
    const r = saveAuthor(payload);
    if (r.ok) {
      toast.success(r.message);
      setOpen(false);
    } else toast.error(r.message);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    const r = deleteAuthor(toDelete.id);
    if (r.ok) toast.success(r.message);
    else toast.error(r.message);
    setToDelete(null);
  };

  return (
    <div>
      <PageHeader
        title="Autores"
        description="Cadastro de autores do acervo e dos títulos vinculados."
        actions={
          <Button onClick={openNew}>
            <Plus /> Novo autor
          </Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="busca-autores" className="sr-only">
            Buscar autores
          </label>
          <Input
            id="busca-autores"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome ou nacionalidade..."
            className="pl-9"
          />
        </div>
      </div>

      {authors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum autor encontrado"
          description="Ajuste a busca ou cadastre um novo autor."
          action={
            <Button onClick={openNew}>
              <Plus /> Novo autor
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Nacionalidade</TableHead>
                <TableHead className="text-center">Títulos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authors.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-semibold">{a.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{a.nacionalidade}</TableCell>
                  <TableCell className="text-center">
                    <StatusBadge tone={a.livros ? "primary" : "neutral"}>
                      <BookCopy className="h-3 w-3" /> {a.livros}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(a)}
                        aria-label={`Editar ${a.nome}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setToDelete(a)}
                        aria-label={`Excluir ${a.nome}`}
                        className="text-destructive hover:text-destructive"
                        title={a.livros ? "Autor possui livros vinculados" : "Excluir autor"}
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
        <DemoNote>a exclusão é bloqueada enquanto houver livros vinculados ao autor.</DemoNote>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar autor" : "Cadastrar autor"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Atualize os dados do autor."
                : "Inclua um novo autor no cadastro bibliográfico."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nome-autor">Nome *</Label>
              <Input
                id="nome-autor"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nacionalidade">Nacionalidade *</Label>
              <Input
                id="nacionalidade"
                value={nacionalidade}
                onChange={(e) => setNacionalidade(e.target.value)}
                placeholder="Brasil"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full sm:w-auto">
                {editing ? "Salvar alterações" : "Cadastrar autor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir autor?</AlertDialogTitle>
            <AlertDialogDescription>
              O cadastro de <strong>{toDelete?.nome ?? ""}</strong> será removido. Autores com
              livros vinculados não podem ser excluídos.
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
