import { errorMiddleware } from "../../middlewares/error.middleware";
import { AppError } from "../../errors/AppError";

const mockReq = () => ({}) as any;
const mockNext = jest.fn();

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("errorMiddleware", () => {
  it("trata AppError com statusCode e mensagem corretos", () => {
    const res = mockRes();
    const err = new AppError("CPF já cadastrado", 409);

    errorMiddleware(err, mockReq(), res, mockNext);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "CPF já cadastrado",
      data: null,
    });
  });

  it("trata AppError com status padrão 400", () => {
    const res = mockRes();
    const err = new AppError("Dados inválidos");

    errorMiddleware(err, mockReq(), res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("trata erro genérico com 500 e mensagem amigável", () => {
    const res = mockRes();
    const err = new Error("algo interno");

    // Suprimir console.error no teste
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    errorMiddleware(err, mockReq(), res, mockNext);
    spy.mockRestore();

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Erro interno do servidor",
      data: null,
    });
  });

  it("trata erro de validação com 422", () => {
    const res = mockRes();
    const err: any = new Error("Validation failed");
    err.name = "ValidationError";

    errorMiddleware(err, mockReq(), res, mockNext);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      status: "error",
      message: "Dados inválidos",
      data: null,
    });
  });
});
