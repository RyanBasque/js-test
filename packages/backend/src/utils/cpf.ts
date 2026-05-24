import { Sequelize } from "sequelize";

export function normalizeCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  if (!digits) return "";
  return digits.padStart(11, "0").slice(-11);
}

export function formatCpf(cpf: string): string {
  const digits = normalizeCpf(cpf);
  if (digits.length !== 11) return cpf.trim();
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function cpfDigitsColumn(column = "cpf") {
  const stripped = Sequelize.fn(
    "REPLACE",
    Sequelize.fn(
      "REPLACE",
      Sequelize.fn("REPLACE", Sequelize.col(column), ".", ""),
      "-",
      ""
    ),
    " ",
    ""
  );
  return Sequelize.fn("LPAD", stripped, 11, "0");
}

export function cpfMatches(digits: string, column = "cpf") {
  return Sequelize.where(cpfDigitsColumn(column), normalizeCpf(digits));
}
