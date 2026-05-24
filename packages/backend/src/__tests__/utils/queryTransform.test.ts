import { parseQueryNumber } from "../../utils/queryTransform";

describe("parseQueryNumber", () => {
  it("retorna undefined para undefined", () => {
    expect(parseQueryNumber(undefined)).toBeUndefined();
  });

  it("retorna undefined para null", () => {
    expect(parseQueryNumber(null)).toBeUndefined();
  });

  it("retorna undefined para string vazia", () => {
    expect(parseQueryNumber("")).toBeUndefined();
  });

  it("converte string numérica para number", () => {
    expect(parseQueryNumber("42")).toBe(42);
  });

  it("converte string decimal", () => {
    expect(parseQueryNumber("3.14")).toBeCloseTo(3.14);
  });

  it("retorna number quando já é number", () => {
    expect(parseQueryNumber(100)).toBe(100);
  });

  it("retorna undefined para string não numérica", () => {
    expect(parseQueryNumber("abc")).toBeUndefined();
  });

  it("retorna undefined para NaN", () => {
    expect(parseQueryNumber(NaN)).toBeUndefined();
  });

  it("retorna undefined para Infinity", () => {
    expect(parseQueryNumber(Infinity)).toBeUndefined();
  });

  it("usa primeiro elemento de array (comportamento Express query)", () => {
    expect(parseQueryNumber(["10", "20"])).toBe(10);
  });

  it("retorna undefined para array com string vazia", () => {
    expect(parseQueryNumber([""])).toBeUndefined();
  });
});
