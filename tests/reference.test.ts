import {
  generateBookingReference,
  generateTicketReference,
  generateToken,
} from "@/lib/reference";

describe("Reference and Token Generation", () => {
  it("generates booking references matching the AYN-XXXXXX pattern", () => {
    const ref = generateBookingReference();
    expect(ref).toMatch(/^AYN-[A-Z0-9]{6}$/);
  });

  it("generates ticket references matching the TCK-XXXXXX pattern", () => {
    const ref = generateTicketReference();
    expect(ref).toMatch(/^TCK-[A-Z0-9]{6}$/);
  });

  it("never includes ambiguous characters (I, O, 0, 1)", () => {
    for (let i = 0; i < 50; i++) {
      const ref = generateBookingReference();
      const body = ref.replace("AYN-", "");
      expect(body).not.toMatch(/[IO01]/);
    }
  });

  it("produces unique references across a batch", () => {
    const set = new Set<string>();
    for (let i = 0; i < 100; i++) {
      set.add(generateBookingReference());
    }
    expect(set.size).toBe(100);
  });

  it("generates cryptographic hex tokens for verification/reset", () => {
    const token = generateToken(16);
    expect(token).toHaveLength(32); // 16 bytes = 32 hex chars
    expect(token).toMatch(/^[0-9a-f]{32}$/);
  });
});

