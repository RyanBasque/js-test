import jwt from "jsonwebtoken";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { AppError } from "../../errors/AppError";

// Mock config
jest.mock("../../config/config", () => ({
  config: { jwtSecret: "test-secret" },
}));

const mockRes = () => ({}) as any;

describe("authMiddleware", () => {
  it("chama next com AppError quando não há header Authorization", () => {
    const req: any = { headers: {} };
    const next = jest.fn();

    authMiddleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("No token provided");
  });

  it("chama next com AppError quando header não começa com Bearer", () => {
    const req: any = { headers: { authorization: "Basic abc123" } };
    const next = jest.fn();

    authMiddleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0] as AppError;
    expect(err.message).toBe("No token provided");
  });

  it("chama next com AppError para token inválido", () => {
    const req: any = { headers: { authorization: "Bearer invalid-token" } };
    const next = jest.fn();

    authMiddleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = next.mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("Invalid or expired token");
  });

  it("seta req.user e chama next() para token válido", () => {
    const token = jwt.sign({ id: 1, email: "test@test.com" }, "test-secret");
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();

    authMiddleware(req, mockRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(1);
    expect(req.user.email).toBe("test@test.com");
  });

  it("chama next com AppError para token expirado", () => {
    const token = jwt.sign(
      { id: 1, email: "test@test.com" },
      "test-secret",
      { expiresIn: "0s" }
    );
    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const next = jest.fn();

    // Espera 1ms para garantir expiração
    setTimeout(() => {
      authMiddleware(req, mockRes(), next);
      expect(next).toHaveBeenCalledWith(expect.any(AppError));
    }, 10);
  });
});
