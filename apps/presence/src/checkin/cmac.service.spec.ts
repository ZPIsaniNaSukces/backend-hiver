import { CmacService, CmacVerificationError } from "./cmac.service";

describe("CmacService", () => {
  let service: CmacService;
  const referenceVector = {
    uidHex: "042C6632A91190",
    counter: 54,
    macHex: "6B8B1F06C2B3B7C1",
    keyHex: "169b35e5fd663d4042224323bc8ebc71",
  };

  beforeEach(() => {
    service = new CmacService();
  });

  it("returns true for the provided NTAG424 reference data", () => {
    const isValid = service.verifyMac(referenceVector);

    expect(isValid).toBe(true);
  });

  it("returns false when MAC from the reference data is tampered", () => {
    const isValid = service.verifyMac({
      ...referenceVector,
      macHex: "FFFFFFFFFFFFFFFF",
    });

    expect(isValid).toBe(false);
  });

  it("throws when UID has invalid length", () => {
    expect(() =>
      service.verifyMac({
        ...referenceVector,
        uidHex: "1234",
        counter: 0,
      }),
    ).toThrow(CmacVerificationError);
  });
});
