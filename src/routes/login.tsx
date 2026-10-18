import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, GraduationCap, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import hero from "@/assets/hero-biblioteca.jpg";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/services/library";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — BiblioConnect" },
      {
        name: "description",
        content: "Acesse o portal da biblioteca com uma conta demonstrativa.",
      },
      { property: "og:title", content: "Entrar — BiblioConnect" },
      { property: "og:description", content: "Acesso demonstrativo ao portal BiblioConnect." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

const demos = [
  { icon: GraduationCap, label: "Estudante", matricula: "2024000123", senha: "demo123" },
  { icon: ShieldCheck, label: "Administrador", matricula: "admin", senha: "admin123" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [show, setShow] = useState(false);
  const [manter, setManter] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!matricula || !senha) return setError("Preencha matrícula e senha.");
    setLoading(true);
    setTimeout(() => {
      const r = login(matricula, senha, manter);
      setLoading(false);
      if (!r.ok) return setError(r.message);
      toast.success(r.message);
      navigate({ to: r.user?.role === "ADMIN" ? "/admin" : "/painel" });
    }, 450);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="relative flex h-full flex-col justify-end p-12 text-ink-foreground">
          <p className="font-display text-4xl font-bold leading-tight">
            Biblioteca na palma da mão.
          </p>
          <p className="mt-3 max-w-md text-ink-muted">
            Consulte, reserve e agende — sem filas no balcão.
          </p>
        </div>
      </div>

      <div className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Brand />
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Início
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm flex-1 py-12">
          <h1 className="text-3xl font-bold">Entrar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acesse com sua identificação acadêmica.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="matricula">Matrícula ou identificação</Label>
              <Input
                id="matricula"
                autoComplete="username"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="senha">Senha</Label>
                <Link
                  to="/recuperar-senha"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="senha"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="manter"
                checked={manter}
                onCheckedChange={(v) => setManter(v === true)}
              />
              <Label htmlFor="manter" className="font-normal">
                Manter conectado
              </Label>
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}
            <Button type="submit" size="lg" className="h-11 w-full" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />} Entrar
            </Button>
          </form>

          <div className="mt-8 rounded-xl border bg-muted p-4">
            <p className="text-sm font-semibold">Contas demonstrativas</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Protótipo sem autenticação institucional real. Clique para preencher:
            </p>
            <div className="mt-3 grid gap-2">
              {demos.map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => {
                    setMatricula(d.matricula);
                    setSenha(d.senha);
                    setError("");
                  }}
                  className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 text-left text-sm transition hover:border-primary"
                >
                  <d.icon className="h-4 w-4 text-primary" />
                  <span className="font-medium">{d.label}</span>
                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {d.matricula} / {d.senha}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
