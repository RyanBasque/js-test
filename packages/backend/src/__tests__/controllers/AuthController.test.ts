import "reflect-metadata";
import AuthController from "../../controllers/AuthController";
import { AppError } from "../../errors/AppError";

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

const mockReq = (body = {}) => ({ body }) as any;
const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("AuthController", () => {
  let controller: AuthController;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(mockAuthService as any);
  });

  describe("register", () => {
    it("retorna 201 com dados do usuário e token", async () => {
      const res = mockRes();
      mockAuthService.register.mockResolvedValue({
        user: { id: 1, name: "João", email: "joao@email.com" },
        token: "jwt-token",
      });

      await controller.register(
        mockReq({
          name: "João",
          email: "joao@email.com",
          cpf: "123.456.789-00",
          password: "123456",
        }),
        res,
        next
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          data: expect.objectContaining({ token: "jwt-token" }),
        })
      );
    });

    it("chama next com erro quando service falha", async () => {
      mockAuthService.register.mockRejectedValue(
        new AppError("Email already in use", 409)
      );

      await controller.register(
        mockReq({
          name: "João",
          email: "joao@email.com",
          cpf: "123.456.789-00",
          password: "123456",
        }),
        mockRes(),
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });

  describe("login", () => {
    it("retorna 200 com token para login válido", async () => {
      const res = mockRes();
      mockAuthService.login.mockResolvedValue({
        user: { id: 1, name: "João", email: "joao@email.com" },
        token: "jwt-token",
      });

      await controller.login(
        mockReq({ email: "joao@email.com", password: "123456" }),
        res,
        next
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          message: "Login successful",
        })
      );
    });

    it("chama next com erro para credenciais inválidas", async () => {
      mockAuthService.login.mockRejectedValue(
        new AppError("Invalid credentials", 401)
      );

      await controller.login(
        mockReq({ email: "x@x.com", password: "wrong" }),
        mockRes(),
        next
      );

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
