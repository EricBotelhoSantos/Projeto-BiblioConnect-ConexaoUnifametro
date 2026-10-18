import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, LibraryBig, MonitorSmartphone } from "lucide-react";
import { DemoNote, PageHeader } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/painel/recursos")({
  head: () => ({
    meta: [
      { title: "Recursos digitais — BiblioConnect" },
      {
        name: "description",
        content: "Acesso aos acervos digitais e bibliotecas virtuais oficiais.",
      },
    ],
  }),
  component: PainelRecursos,
});

const resources = [
  {
    nome: "Biblioteca UNIFAMETRO",
    descricao: "Página oficial da biblioteca: serviços, normas de uso e contato com o balcão.",
    url: "https://unifametro.edu.br/biblioteca-unifametro/",
    tag: "Institucional",
  },
  {
    nome: "Portal Periódicos CAPES",
    descricao:
      "Base brasileira de periódicos científicos com acesso aberto a milhares de revistas.",
    url: "https://www.periodicos.capes.gov.br/",
    tag: "Base de periódicos",
  },
  {
    nome: "SciELO",
    descricao: "Biblioteca virtual de publicações científicas brasileiras em acesso aberto.",
    url: "https://www.scielo.br/",
    tag: "Acesso aberto",
  },
  {
    nome: "Google Scholar",
    descricao: "Busca acadêmica por artigos, teses, livros e citações de autores.",
    url: "https://scholar.google.com/",
    tag: "Busca acadêmica",
  },
  {
    nome: "DOAJ — Directory of Open Access Journals",
    descricao: "Diretório internacional de revistas de acesso aberto revisadas por pares.",
    url: "https://doaj.org/",
    tag: "Acesso aberto",
  },
  {
    nome: "BDTD — Bibliografia Brasileira de Teses e Dissertações",
    descricao: "Índice nacional de teses e dissertações registradas no CNPq.",
    url: "http://bdtd.cnpq.br/",
    tag: "Teses e dissertações",
  },
] as const;

function PainelRecursos() {
  return (
    <div>
      <PageHeader
        title="Recursos digitais"
        description="Links oficiais para pesquisa e estudo, selecionados pela biblioteca."
      />
      <DemoNote>
        estes são serviços oficiais (externos ao protótipo) — os links abrem em nova aba e não
        utilizam os dados fictícios do BiblioConnect.
      </DemoNote>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col rounded-xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:shadow-lift"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground">
                {r.tag}
              </span>
              <ExternalLink
                className="h-4 w-4 text-muted-foreground transition group-hover:text-primary"
                aria-hidden="true"
              />
            </div>
            <h2 className="mt-3 font-display font-semibold group-hover:text-primary">{r.nome}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{r.descricao}</p>
          </a>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="flex flex-wrap items-center gap-4 pt-6">
          <span className="rounded-lg bg-primary-soft p-2 text-primary">
            <LibraryBig className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">Precisa de um artigo que não encontrou?</h2>
            <p className="text-sm text-muted-foreground">
              Procure o balcão da biblioteca para solicitar aquisição ou empréstimo
              interbibliotecas.
            </p>
          </div>
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <MonitorSmartphone className="h-4 w-4" /> Acesso remoto via VPN institucional
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
