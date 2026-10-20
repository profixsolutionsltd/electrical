import {
  calculateSubtotal,
  calculateVat,
  calculateTotals,
  parseMoneyToPence,
  penceToDecimal,
} from "@/lib/pricing";

describe("Pricing and VAT Engine", () => {
  it("calculates subtotal accurately for multiple line items", () => {
    const lines = [
      { unitPrice: 6900, quantity: 1 }, // £69.00
      { unitPrice: 4500, quantity: 2 }, // £90.00
    ];
    expect(calculateSubtotal(lines)).toBe(15900); // £159.00
  });

  it("handles zero and negative quantities gracefully", () => {
    const lines = [
      { unitPrice: 6900, quantity: 0 },
      { unitPrice: 4500, quantity: -2 },
    ];
    expect(calculateSubtotal(lines)).toBe(0);
  });

  it("computes VAT rounded to nearest integer penny", () => {
    // 20% on £79.55 (7955 pence) = 1591 pence
    expect(calculateVat(7955, 20)).toBe(1591);
    // 20% on £100.00 (10000 pence) = 2000 pence
    expect(calculateVat(10000, 20)).toBe(2000);
  });

  it("calculates full totals with standard 20% VAT", () => {
    const lines = [{ unitPrice: 10000, quantity: 1, vatApplicable: true }];
    const totals = calculateTotals(lines, { vatRate: 20 });
    expect(totals.subtotal).toBe(10000);
    expect(totals.vatRate).toBe(20);
    expect(totals.vatAmount).toBe(2000);
    expect(totals.total).toBe(12000);
  });

  it("correctly handles mixed tax baskets (zero-rated items)", () => {
    const lines = [
      { unitPrice: 10000, quantity: 1, vatApplicable: true }, // taxable: 10000
      { unitPrice: 5000, quantity: 1, vatApplicable: false }, // exempt: 5000
    ];
    const totals = calculateTotals(lines, { vatRate: 20 });
    expect(totals.subtotal).toBe(15000);
    expect(totals.vatAmount).toBe(2000); // 20% of 10000 only
    expect(totals.total).toBe(17000); // 15000 + 2000
  });

  it("applies discounts and clamps total at zero", () => {
    const lines = [{ unitPrice: 5000, quantity: 1, vatApplicable: false }];
    const withDiscount = calculateTotals(lines, { discount: 2000, vatRate: 0 });
    expect(withDiscount.total).toBe(3000);

    const excessiveDiscount = calculateTotals(lines, { discount: 10000, vatRate: 0 });
    expect(excessiveDiscount.total).toBe(0);
  });

  it("parses money string to integer pence", () => {
    expect(parseMoneyToPence("69.00")).toBe(6900);
    expect(parseMoneyToPence("£129.99")).toBe(12999);
    expect(parseMoneyToPence("0.50")).toBe(50);
    expect(parseMoneyToPence("invalid")).toBe(0);
  });

  it("formats integer pence as decimal string", () => {
    expect(penceToDecimal(6900)).toBe("69.00");
    expect(penceToDecimal(12999)).toBe("129.99");
    expect(penceToDecimal(50)).toBe("0.50");
  });
});

