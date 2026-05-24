import { normalizeCpf, formatCpf } from "../../utils/cpf";

describe("normalizeCpf", () => {
  it("remove pontos e traço de CPF formatado", () => {
    expect(normalizeCpf("123.456.789-00")).toBe("12345678900");
  });

  it("faz padStart com zeros à esquerda", () => {
    expect(normalizeCpf("1234567890")).toBe("01234567890");
  });

  it("retorna string vazia para input vazio", () => {
    expect(normalizeCpf("")).toBe("");
  });

  it("lida com CPF somente dígitos", () => {
    expect(normalizeCpf("12345678900")).toBe("12345678900");
  });

  it("remove caracteres não numéricos arbitrários", () => {
    expect(normalizeCpf("abc123def456ghi789jkl00")).toBe("12345678900");
  });

  it("retorna últimos 11 dígitos quando há mais de 11", () => {
    expect(normalizeCpf("99912345678900")).toBe("12345678900");
  });
});

describe("formatCpf", () => {
  it("formata CPF com pontos e traço", () => {
    expect(formatCpf("12345678900")).toBe("123.456.789-00");
  });

  it("formata CPF já formatado corretamente", () => {
    expect(formatCpf("123.456.789-00")).toBe("123.456.789-00");
  });

  it("adiciona zeros à esquerda e formata", () => {
    expect(formatCpf("1234567890")).toBe("012.345.678-90");
  });

  it("retorna input trimado quando CPF não tem 11 dígitos após normalizar", () => {
    expect(formatCpf("")).toBe("");
  });
});
