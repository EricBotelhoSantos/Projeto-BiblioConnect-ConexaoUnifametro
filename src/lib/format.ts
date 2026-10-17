export const fmtDate = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");

export const initials = (nome: string) =>
  nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
