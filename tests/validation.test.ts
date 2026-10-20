import {
  loginSchema,
  registerSchema,
  bookingDraftSchema,
} from "@/lib/validation";

describe("Input Validation Schemas", () => {
  describe("loginSchema", () => {
    it("accepts valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "SecretPassword123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "SecretPassword123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("validates successful registration payload", () => {
      const result = registerSchema.safeParse({
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "+44 7700 900123",
        role: "CUSTOMER",
        password: "StrongPassword1",
        confirmPassword: "StrongPassword1",
        acceptTerms: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects weak passwords (missing digit or uppercase)", () => {
      const result = registerSchema.safeParse({
        name: "Jane Doe",
        email: "jane@example.com",
        role: "CUSTOMER",
        password: "weakpassword",
        confirmPassword: "weakpassword",
        acceptTerms: true,
      });
      expect(result.success).toBe(false);
    });

    it("rejects password mismatch", () => {
      const result = registerSchema.safeParse({
        name: "Jane Doe",
        email: "jane@example.com",
        role: "CUSTOMER",
        password: "Password123",
        confirmPassword: "DifferentPassword123",
        acceptTerms: true,
      });
      expect(result.success).toBe(false);
    });

    it("rejects unaccepted terms", () => {
      const result = registerSchema.safeParse({
        name: "Jane Doe",
        email: "jane@example.com",
        role: "CUSTOMER",
        password: "Password123",
        confirmPassword: "Password123",
        acceptTerms: false,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("bookingDraftSchema", () => {
    it("validates well-formed booking submission", () => {
      const result = bookingDraftSchema.safeParse({
        serviceIds: ["srv_1", "srv_2"],
        addressLine1: "123 High Street",
        city: "London",
        postcode: "SW1A 1AA",
        scheduledDate: "2026-11-20",
        timeWindow: "MORNING",
        contactName: "Alex Smith",
        contactEmail: "alex@example.com",
        contactPhone: "07700900123",
        paymentMethod: "PAY_LATER",
      });
      expect(result.success).toBe(true);
    });

    it("rejects booking with empty services array", () => {
      const result = bookingDraftSchema.safeParse({
        serviceIds: [],
        addressLine1: "123 High Street",
        city: "London",
        postcode: "SW1A 1AA",
        scheduledDate: "2026-11-20",
        timeWindow: "MORNING",
        contactName: "Alex Smith",
        contactEmail: "alex@example.com",
        contactPhone: "07700900123",
      });
      expect(result.success).toBe(false);
    });
  });
});
