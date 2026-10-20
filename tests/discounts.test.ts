import { computeDiscount, normaliseCode } from "@/lib/discounts";

describe("Discount codes", () => {
  it("normalises user input", () => {
    expect(normaliseCode("  welcome 10 ")).toBe("WELCOME10");
    expect(normaliseCode("welcome-10")).toBe("WELCOME-10");
    expect(normaliseCode("   ")).toBe("");
  });

  it("applies a percentage discount", () => {
    const result = computeDiscount({ type: "PERCENT", value: 10 }, 10000);
    expect(result.valid).toBe(true);
    expect(result.amount).toBe(1000);
  });

  it("applies a fixed discount", () => {
    const result = computeDiscount({ type: "FIXED", value: 2500 }, 10000);
    expect(result.valid).toBe(true);
    expect(result.amount).toBe(2500);
  });

  it("never discounts more than the subtotal", () => {
    const result = computeDiscount({ type: "FIXED", value: 20000 }, 10000);
    expect(result.amount).toBe(10000);
  });

  it("rejects codes below the minimum spend", () => {
    const result = computeDiscount({ type: "PERCENT", value: 10, minSubtotal: 5000 }, 1000);
    expect(result.valid).toBe(false);
    expect(result.amount).toBe(0);
    expect(result.reason).toContain("minimum order");
  });

  it("rejects a zero-value discount", () => {
    const result = computeDiscount({ type: "PERCENT", value: 0 }, 10000);
    expect(result.valid).toBe(false);
    expect(result.amount).toBe(0);
  });

  it("clamps a percentage above 100", () => {
    const result = computeDiscount({ type: "PERCENT", value: 150 }, 10000);
    expect(result.amount).toBe(10000);
  });
});
