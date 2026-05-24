import { sendSuccess } from "../../utils/response";

describe("sendSuccess", () => {
  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it("envia resposta com status 200 por padrão", () => {
    const res = mockRes();
    sendSuccess(res, { id: 1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Success",
      data: { id: 1 },
    });
  });

  it("envia resposta com status e mensagem customizados", () => {
    const res = mockRes();
    sendSuccess(res, { ok: true }, "Created!", 201);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Created!",
      data: { ok: true },
    });
  });

  it("envia data null quando passado null", () => {
    const res = mockRes();
    sendSuccess(res, null);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "Success",
      data: null,
    });
  });
});
