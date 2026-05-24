import { resolvePage } from "../../utils/pagination";

describe("resolvePage", () => {
  it("retorna página 1 e offset 0 para primeira página", () => {
    const result = resolvePage(1, 50, 20);
    expect(result).toEqual({ page: 1, offset: 0, totalPages: 3 });
  });

  it("calcula offset correto para página 2", () => {
    const result = resolvePage(2, 50, 20);
    expect(result).toEqual({ page: 2, offset: 20, totalPages: 3 });
  });

  it("limita para última página quando página solicitada excede o total", () => {
    const result = resolvePage(999, 50, 20);
    expect(result).toEqual({ page: 3, offset: 40, totalPages: 3 });
  });

  it("retorna página 1 quando página solicitada é 0 ou negativa", () => {
    expect(resolvePage(0, 50, 20)).toEqual({ page: 1, offset: 0, totalPages: 3 });
    expect(resolvePage(-5, 50, 20)).toEqual({ page: 1, offset: 0, totalPages: 3 });
  });

  it("retorna totalPages 1 quando total é 0", () => {
    const result = resolvePage(1, 0, 20);
    expect(result).toEqual({ page: 1, offset: 0, totalPages: 1 });
  });

  it("calcula totalPages corretamente com divisão exata", () => {
    const result = resolvePage(1, 40, 20);
    expect(result).toEqual({ page: 1, offset: 0, totalPages: 2 });
  });

  it("arredonda totalPages pra cima", () => {
    const result = resolvePage(1, 41, 20);
    expect(result).toEqual({ page: 1, offset: 0, totalPages: 3 });
  });
});
