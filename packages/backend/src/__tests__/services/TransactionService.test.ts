import "reflect-metadata";
import TransactionService from "../../services/TransactionService";
import { AppError } from "../../errors/AppError";

const mockTransactionRepo = {
  createMany: jest.fn(),
  findAll: jest.fn(),
  findByUserId: jest.fn(),
  linkOrphanTransactionsByCpfs: jest.fn(),
  getApprovedPointsBalance: jest.fn(),
  getApprovedMonetaryBalance: jest.fn(),
  getApprovedPointsBalanceByCpfs: jest.fn(),
  getDistinctCpfs: jest.fn(),
  sumFiltered: jest.fn(),
};

const mockUserRepo = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByCpf: jest.fn(),
  findByCpfs: jest.fn(),
  create: jest.fn(),
};

describe("TransactionService", () => {
  let service: TransactionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TransactionService(
      mockTransactionRepo as any,
      mockUserRepo as any
    );
  });

  describe("uploadCsv", () => {
    it("processa CSV válido e retorna contagem de criados", async () => {
      const csv = Buffer.from(
        "cpf,transaction_description,transaction_date,points_value,monetary_value,status\n" +
          "123.456.789-00,Compra,2025-01-15,100,50.00,approved\n" +
          "987.654.321-00,Venda,2025-01-16,200,80.00,pending\n"
      );

      mockUserRepo.findByCpfs.mockResolvedValue([]);
      mockTransactionRepo.createMany.mockResolvedValue(undefined);
      mockTransactionRepo.linkOrphanTransactionsByCpfs.mockResolvedValue(
        undefined
      );

      const result = await service.uploadCsv(csv);

      expect(result.created).toBe(2);
      expect(result.skipped).toBe(0);
      expect(mockTransactionRepo.createMany).toHaveBeenCalledTimes(1);
      const records = mockTransactionRepo.createMany.mock.calls[0][0];
      expect(records).toHaveLength(2);
      expect(records[0].description).toBe("Compra");
      expect(records[1].description).toBe("Venda");
    });

    it("pula linhas com dados inválidos", async () => {
      const csv = Buffer.from(
        "cpf,transaction_description,transaction_date,points_value,monetary_value,status\n" +
          "123.456.789-00,Compra,2025-01-15,100,50.00,approved\n" +
          ",Sem CPF,2025-01-16,200,80.00,pending\n" +
          "111.222.333-44,Data invalida,invalid-date,100,50.00,approved\n"
      );

      mockUserRepo.findByCpfs.mockResolvedValue([]);
      mockTransactionRepo.createMany.mockResolvedValue(undefined);
      mockTransactionRepo.linkOrphanTransactionsByCpfs.mockResolvedValue(
        undefined
      );

      const result = await service.uploadCsv(csv);

      expect(result.created).toBe(1);
      expect(result.skipped).toBe(2);
    });

    it("lança erro 422 para CSV vazio", async () => {
      const csv = Buffer.from(
        "cpf,transaction_description,transaction_date,points_value,monetary_value,status\n"
      );

      await expect(service.uploadCsv(csv)).rejects.toThrow(AppError);
      await expect(service.uploadCsv(csv)).rejects.toMatchObject({
        statusCode: 422,
      });
    });

    it("normaliza status para pending/approved/rejected", async () => {
      const csv = Buffer.from(
        "cpf,transaction_description,transaction_date,points_value,monetary_value,status\n" +
          "123.456.789-00,A,2025-01-15,100,50.00,aprovado\n" +
          "123.456.789-00,B,2025-01-15,100,50.00,rejeitado\n" +
          "123.456.789-00,C,2025-01-15,100,50.00,desconhecido\n"
      );

      mockUserRepo.findByCpfs.mockResolvedValue([]);
      mockTransactionRepo.createMany.mockResolvedValue(undefined);
      mockTransactionRepo.linkOrphanTransactionsByCpfs.mockResolvedValue(
        undefined
      );

      await service.uploadCsv(csv);

      const records = mockTransactionRepo.createMany.mock.calls[0][0];
      expect(records[0].status).toBe("approved");
      expect(records[1].status).toBe("rejected");
      expect(records[2].status).toBe("pending");
    });

    it("vincula userId quando CPF corresponde a usuário existente", async () => {
      const csv = Buffer.from(
        "cpf,transaction_description,transaction_date,points_value,monetary_value,status\n" +
          "123.456.789-00,Compra,2025-01-15,100,50.00,approved\n"
      );

      mockUserRepo.findByCpfs.mockResolvedValue([
        { id: 42, cpf: "123.456.789-00" },
      ]);
      mockTransactionRepo.createMany.mockResolvedValue(undefined);
      mockTransactionRepo.linkOrphanTransactionsByCpfs.mockResolvedValue(
        undefined
      );

      await service.uploadCsv(csv);

      const records = mockTransactionRepo.createMany.mock.calls[0][0];
      expect(records[0].userId).toBe(42);
    });
  });

  describe("getAdminReport", () => {
    it("retorna resultado paginado", async () => {
      mockTransactionRepo.findAll.mockResolvedValue({
        rows: [{ id: 1 }, { id: 2 }],
        count: 50,
      });

      const result = await service.getAdminReport({
        page: 1,
        limit: 20,
      } as any);

      expect(result.rows).toHaveLength(2);
      expect(result.total).toBe(50);
      expect(result.totalPages).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it("retorna totalPages 0 quando não há registros", async () => {
      mockTransactionRepo.findAll.mockResolvedValue({
        rows: [],
        count: 0,
      });

      const result = await service.getAdminReport({
        page: 1,
        limit: 20,
      } as any);

      expect(result.totalPages).toBe(0);
      expect(result.page).toBe(1);
      expect(result.total).toBe(0);
    });

    it("limita página ao máximo quando excede totalPages", async () => {
      mockTransactionRepo.findAll.mockResolvedValue({
        rows: [],
        count: 10,
      });

      const result = await service.getAdminReport({
        page: 999,
        limit: 20,
      } as any);

      expect(result.page).toBe(1); // só tem 1 página
    });
  });

  describe("getUserStatement", () => {
    it("retorna extrato com somas de pontos e valor", async () => {
      mockUserRepo.findById.mockResolvedValue({
        id: 1,
        cpf: "123.456.789-00",
      });
      mockTransactionRepo.linkOrphanTransactionsByCpfs.mockResolvedValue(
        undefined
      );
      mockTransactionRepo.findByUserId.mockResolvedValue({
        rows: [{ id: 1 }],
        count: 1,
      });
      mockTransactionRepo.sumFiltered
        .mockResolvedValueOnce(500) // pointsSum
        .mockResolvedValueOnce(250.5); // monetarySum

      const result = await service.getUserStatement(1, {
        page: 1,
        limit: 20,
      } as any);

      expect(result.approvedPointsSum).toBe(500);
      expect(result.approvedMonetarySum).toBe(250.5);
      expect(result.rows).toHaveLength(1);
    });

    it("lança erro 404 quando usuário não existe", async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(
        service.getUserStatement(999, { page: 1, limit: 20 } as any)
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "User not found",
      });
    });

    it("passa filtros corretos para sumFiltered", async () => {
      mockUserRepo.findById.mockResolvedValue({
        id: 1,
        cpf: "123.456.789-00",
      });
      mockTransactionRepo.linkOrphanTransactionsByCpfs.mockResolvedValue(
        undefined
      );
      mockTransactionRepo.findByUserId.mockResolvedValue({
        rows: [],
        count: 0,
      });
      mockTransactionRepo.sumFiltered.mockResolvedValue(0);

      await service.getUserStatement(1, {
        page: 1,
        limit: 20,
        status: "approved",
        dateFrom: "2025-01-01",
        dateTo: "2025-12-31",
      } as any);

      expect(mockTransactionRepo.sumFiltered).toHaveBeenCalledWith(
        "pointsValue",
        ["123.456.789-00"],
        { status: "approved", dateFrom: "2025-01-01", dateTo: "2025-12-31" }
      );
      expect(mockTransactionRepo.sumFiltered).toHaveBeenCalledWith(
        "monetaryValue",
        ["123.456.789-00"],
        { status: "approved", dateFrom: "2025-01-01", dateTo: "2025-12-31" }
      );
    });
  });

  describe("getWalletBalance", () => {
    it("retorna saldo de pontos para usuário", async () => {
      mockUserRepo.findById.mockResolvedValue({
        id: 1,
        cpf: "123.456.789-00",
      });
      mockTransactionRepo.linkOrphanTransactionsByCpfs.mockResolvedValue(
        undefined
      );
      mockTransactionRepo.getApprovedPointsBalance.mockResolvedValue(1500);

      const result = await service.getWalletBalance(1);

      expect(result.pointsBalance).toBe(1500);
    });

    it("retorna saldo filtrado por CPFs quando fornecidos", async () => {
      mockUserRepo.findById.mockResolvedValue({
        id: 1,
        cpf: "123.456.789-00",
      });
      mockTransactionRepo.linkOrphanTransactionsByCpfs.mockResolvedValue(
        undefined
      );
      mockTransactionRepo.getApprovedPointsBalanceByCpfs.mockResolvedValue(800);

      const result = await service.getWalletBalance(1, [
        "123.456.789-00",
        "987.654.321-00",
      ]);

      expect(result.pointsBalance).toBe(800);
      expect(
        mockTransactionRepo.getApprovedPointsBalanceByCpfs
      ).toHaveBeenCalledWith(["123.456.789-00", "987.654.321-00"]);
    });

    it("lança erro 404 quando usuário não existe", async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(service.getWalletBalance(999)).rejects.toMatchObject({
        statusCode: 404,
        message: "User not found",
      });
    });
  });

  describe("getAllCpfs", () => {
    it("retorna lista de CPFs distintos", async () => {
      mockTransactionRepo.getDistinctCpfs.mockResolvedValue([
        "123.456.789-00",
        "987.654.321-00",
      ]);

      const result = await service.getAllCpfs();

      expect(result).toEqual(["123.456.789-00", "987.654.321-00"]);
    });
  });
});
