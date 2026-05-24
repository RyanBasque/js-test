import { AppError } from "../../errors/AppError";

describe("AppError", () => {
  it("cria erro com mensagem e statusCode padrão 400", () => {
    const err = new AppError("Algo deu errado");
    expect(err.message).toBe("Algo deu errado");
    expect(err.statusCode).toBe(400);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it("cria erro com statusCode customizado", () => {
    const err = new AppError("Não encontrado", 404);
    expect(err.message).toBe("Não encontrado");
    expect(err.statusCode).toBe(404);
  });

  it("é capturável como Error genérico", () => {
    const err = new AppError("teste", 500);
    expect(() => {
      throw err;
    }).toThrow(Error);
  });

  it("instanceof funciona corretamente", () => {
    const err = new AppError("teste");
    expect(err instanceof AppError).toBe(true);
    expect(err instanceof Error).toBe(true);
  });
});
