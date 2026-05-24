import "reflect-metadata";
import { validateDto } from "../../utils/validate";
import { RegisterDto, LoginDto } from "../../dtos/auth.dto";
import { AppError } from "../../errors/AppError";

describe("validateDto", () => {
  describe("RegisterDto", () => {
    it("valida DTO correto com sucesso", async () => {
      const data = {
        name: "João",
        email: "joao@email.com",
        cpf: "123.456.789-00",
        password: "123456",
      };
      const result = await validateDto(RegisterDto, data);
      expect(result).toBeInstanceOf(RegisterDto);
      expect(result.name).toBe("João");
      expect(result.email).toBe("joao@email.com");
    });

    it("rejeita email inválido", async () => {
      const data = {
        name: "João",
        email: "invalid",
        cpf: "123.456.789-00",
        password: "123456",
      };
      await expect(validateDto(RegisterDto, data)).rejects.toThrow(AppError);
    });

    it("rejeita CPF com formato inválido", async () => {
      const data = {
        name: "João",
        email: "joao@email.com",
        cpf: "12345",
        password: "123456",
      };
      await expect(validateDto(RegisterDto, data)).rejects.toThrow(AppError);
    });

    it("rejeita senha com menos de 6 caracteres", async () => {
      const data = {
        name: "João",
        email: "joao@email.com",
        cpf: "123.456.789-00",
        password: "123",
      };
      await expect(validateDto(RegisterDto, data)).rejects.toThrow(AppError);
    });

    it("rejeita quando campos obrigatórios faltam", async () => {
      await expect(validateDto(RegisterDto, {})).rejects.toThrow(AppError);
    });
  });

  describe("LoginDto", () => {
    it("valida login correto", async () => {
      const data = { email: "joao@email.com", password: "123456" };
      const result = await validateDto(LoginDto, data);
      expect(result.email).toBe("joao@email.com");
    });

    it("rejeita login sem email", async () => {
      await expect(
        validateDto(LoginDto, { password: "123456" })
      ).rejects.toThrow(AppError);
    });
  });
});
