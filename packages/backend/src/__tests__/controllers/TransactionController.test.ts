import "reflect-metadata";
import TransactionController from "../../controllers/TransactionController";
import { AppError } from "../../errors/AppError";

const mockTransactionService = {
  uploadCsv: jest.fn(),
  getAdminReport: jest.fn(),
  getUserStatement: jest.fn(),
  getWalletBalance: jest.fn(),
  getAllCpfs: jest.fn(),
};

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("TransactionController", () => {
  let controller: TransactionController;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new TransactionController(mockTransactionService as any);
  });

  describe("upload", () => {
    it("retorna 201 após processar CSV com sucesso", async () => {
      const res = mockRes();
      const req: any = { file: { buffer: Buffer.from("csv-data") } };
      mockTransactionService.uploadCsv.mockResolvedValue({
        created: 5,
        skipped: 1,
      });

      await controller.upload(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          data: { created: 5, skipped: 1 },
        })
      );
    });

    it("chama next com AppError quando arquivo não enviado", async () => {
      const req: any = { file: undefined };

      await controller.upload(req, mockRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const err = next.mock.calls[0][0] as AppError;
      expect(err.statusCode).toBe(400);
    });
  });

  describe("getReport", () => {
    it("retorna relatório com sucesso", async () => {
      const res = mockRes();
      const req: any = { query: { page: "1", limit: "20" } };
      mockTransactionService.getAdminReport.mockResolvedValue({
        rows: [{ id: 1 }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      await controller.getReport(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          message: "Report retrieved successfully",
        })
      );
    });

    it("chama next com erro quando service falha", async () => {
      const req: any = { query: { status: "invalid" } };
      mockTransactionService.getAdminReport.mockRejectedValue(
        new AppError("Validation error", 422)
      );

      await controller.getReport(req, mockRes(), next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("getStatement", () => {
    it("retorna extrato com sucesso", async () => {
      const res = mockRes();
      const req: any = {
        query: {},
        user: { id: 1, email: "joao@email.com" },
      };
      mockTransactionService.getUserStatement.mockResolvedValue({
        rows: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        approvedPointsSum: 100,
        approvedMonetarySum: 50,
      });

      await controller.getStatement(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockTransactionService.getUserStatement).toHaveBeenCalledWith(
        1,
        expect.anything()
      );
    });
  });

  describe("getWallet", () => {
    it("retorna saldo sem filtro de CPFs", async () => {
      const res = mockRes();
      const req: any = {
        query: {},
        user: { id: 1, email: "joao@email.com" },
      };
      mockTransactionService.getWalletBalance.mockResolvedValue({
        pointsBalance: 1500,
      });

      await controller.getWallet(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockTransactionService.getWalletBalance).toHaveBeenCalledWith(
        1,
        undefined
      );
    });

    it("passa CPFs parseados quando query param presente", async () => {
      const res = mockRes();
      const req: any = {
        query: { cpfs: "123.456.789-00,987.654.321-00" },
        user: { id: 1, email: "joao@email.com" },
      };
      mockTransactionService.getWalletBalance.mockResolvedValue({
        pointsBalance: 800,
      });

      await controller.getWallet(req, res, next);

      expect(mockTransactionService.getWalletBalance).toHaveBeenCalledWith(1, [
        "123.456.789-00",
        "987.654.321-00",
      ]);
    });
  });

  describe("getCpfs", () => {
    it("retorna lista de CPFs distintos", async () => {
      const res = mockRes();
      const req: any = {};
      mockTransactionService.getAllCpfs.mockResolvedValue([
        "123.456.789-00",
        "987.654.321-00",
      ]);

      await controller.getCpfs(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "success",
          data: ["123.456.789-00", "987.654.321-00"],
        })
      );
    });
  });
});
