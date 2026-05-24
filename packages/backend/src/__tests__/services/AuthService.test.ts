import "reflect-metadata";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AuthService from "../../services/AuthService";
import { AppError } from "../../errors/AppError";

jest.mock("../../config/config", () => ({
  config: { jwtSecret: "test-secret", jwtExpiresIn: "7d" },
}));

const mockUserRepo = {
  findByEmail: jest.fn(),
  findByCpf: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByCpfs: jest.fn(),
};

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(mockUserRepo as any);
  });

  describe("register", () => {
    const dto = {
      name: "João Silva",
      email: "joao@email.com",
      cpf: "123.456.789-00",
      password: "123456",
    };

    it("registra usuário com sucesso e retorna token", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.findByCpf.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue({
        id: 1,
        name: "João Silva",
        email: "joao@email.com",
      });

      const result = await service.register(dto);

      expect(result.user).toEqual({
        id: 1,
        name: "João Silva",
        email: "joao@email.com",
      });
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe("string");

      // Verifica que o token é válido
      const decoded = jwt.verify(result.token, "test-secret") as any;
      expect(decoded.id).toBe(1);
      expect(decoded.email).toBe("joao@email.com");
    });

    it("lança erro 409 quando email já existe", async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: 1 });
      mockUserRepo.findByCpf.mockResolvedValue(null);

      await expect(service.register(dto)).rejects.toThrow(AppError);
      await expect(service.register(dto)).rejects.toMatchObject({
        statusCode: 409,
        message: "Email already in use",
      });
    });

    it("lança erro 409 quando CPF já existe", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.findByCpf.mockResolvedValue({ id: 1 });

      await expect(service.register(dto)).rejects.toThrow(AppError);
      await expect(service.register(dto)).rejects.toMatchObject({
        statusCode: 409,
        message: "CPF already registered",
      });
    });

    it("salva senha hasheada (não em texto plano)", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.findByCpf.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue({
        id: 1,
        name: "João Silva",
        email: "joao@email.com",
      });

      await service.register(dto);

      const createCall = mockUserRepo.create.mock.calls[0][0];
      expect(createCall.password).not.toBe("123456");
      const isHash = await bcrypt.compare("123456", createCall.password);
      expect(isHash).toBe(true);
    });

    it("formata CPF antes de salvar", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.findByCpf.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue({
        id: 1,
        name: "João Silva",
        email: "joao@email.com",
      });

      await service.register({ ...dto, cpf: "12345678900" });

      const createCall = mockUserRepo.create.mock.calls[0][0];
      expect(createCall.cpf).toBe("123.456.789-00");
    });
  });

  describe("login", () => {
    it("retorna token para credenciais válidas", async () => {
      const hashedPass = await bcrypt.hash("123456", 10);
      mockUserRepo.findByEmail.mockResolvedValue({
        id: 1,
        name: "João Silva",
        email: "joao@email.com",
        password: hashedPass,
      });

      const result = await service.login({
        email: "joao@email.com",
        password: "123456",
      });

      expect(result.user).toEqual({
        id: 1,
        name: "João Silva",
        email: "joao@email.com",
      });
      expect(result.token).toBeDefined();
    });

    it("lança erro 401 quando email não encontrado", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: "x@x.com", password: "123456" })
      ).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid credentials",
      });
    });

    it("lança erro 401 quando senha está errada", async () => {
      const hashedPass = await bcrypt.hash("correta", 10);
      mockUserRepo.findByEmail.mockResolvedValue({
        id: 1,
        name: "João",
        email: "joao@email.com",
        password: hashedPass,
      });

      await expect(
        service.login({ email: "joao@email.com", password: "errada" })
      ).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid credentials",
      });
    });
  });
});
