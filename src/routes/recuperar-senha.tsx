import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — BiblioConnect" },
      {
        name: "description",
        content: "Simulação de recuperação de senha do portal BiblioConnect.",
      },
      { property: "og:title", content: "Recuperar senha — BiblioConnect" },
      { property: "og:description", content: "Recuperação de senha demonstrativa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const [m, setM] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-grid px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-lift">
        <Brand />
        {sent ? (
          <div className="mt-8 text-center" role="status">
            <MailCheck className="mx-auto h-10 w-10 text-success" />
            <h1 className="mt-3 text-xl font-bold">Solicitação simulada</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Em um sistema real, as instruções seriam enviadas ao e-mail institucional. Nenhuma
              mensagem foi enviada.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (m.trim()) setSent(true);
            }}
            className="mt-8 space-y-4"
          >
            <h1 className="text-xl font-bold">Recuperar senha</h1>
            <div className="space-y-1.5">
              <Label htmlFor="mat">Matrícula</Label>
              <Input id="mat" value={m} onChange={(e) => setM(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full">
              Enviar instruções
            </Button>
          </form>
        )}
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao login
        </Link>
      </div>
    </div>
  );
}
