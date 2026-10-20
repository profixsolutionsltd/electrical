import { z } from "zod";
import { ROLES } from "./constants";

/**
 * Shared Zod validation schemas. These are used both client-side (react-hook-form)
 * and — critically — server-side to validate all incoming data. Server routes
 * always re-parse with these schemas; never trust client validation.
 */

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name"),
    email: emailSchema,
    phone: z
      .string()
      .trim()
      .optional()
      .refine(
        (v) => !v || /^[+()\-\s0-9]{7,20}$/.test(v),
        "Enter a valid phone number",
      ),
    role: z.enum([ROLES.CUSTOMER, ROLES.ENGINEER, ROLES.ADMIN]).default(
      ROLES.CUSTOMER,
    ),
    password: passwordSchema,
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms to continue" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const postcodeSchema = z
  .string()
  .trim()
  .min(1, "Postcode is required")
  .regex(
    /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/,
    "Enter a valid UK postcode",
  );

export const addressSchema = z.object({
  addressLine1: z.string().trim().min(3, "Enter the first line of the address"),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2, "Enter a town or city"),
  postcode: postcodeSchema,
});

export const propertySchema = addressSchema.extend({
  label: z.string().trim().min(1, "Give this property a label"),
  propertyType: z.string().trim().optional(),
  bedrooms: z.coerce.number().int().min(0).max(50).optional(),
  notes: z.string().trim().optional(),
  isDefault: z.boolean().optional(),
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and dashes"),
  summary: z.string().trim().min(5, "Add a short summary"),
  description: z.string().trim().min(10, "Add a description"),
  priceFrom: z.coerce.number().int().min(0, "Price must be positive"),
  durationMinutes: z.coerce.number().int().min(15).max(1440),
  categoryId: z.string().min(1, "Select a category"),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  vatApplicable: z.boolean().optional(),
});

export const bookingDraftSchema = z.object({
  serviceIds: z.array(z.string()).min(1, "Select at least one service"),
  addressLine1: z.string().trim().min(3),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(2),
  postcode: postcodeSchema,
  contactName: z.string().trim().min(2),
  contactPhone: z.string().trim().min(7),
  contactEmail: emailSchema,
  scheduledDate: z.string().min(1, "Choose a date"),
  timeWindow: z.enum(["MORNING", "AFTERNOON", "EVENING"]),
  notes: z.string().trim().optional(),
  paymentMethod: z.enum(["PAY_LATER", "CARD"]).optional(),
  propertyId: z.string().optional(),
});

export const ticketSchema = z.object({
  subject: z.string().trim().min(4, "Add a subject"),
  message: z.string().trim().min(10, "Please describe your issue"),
  bookingId: z.string().optional(),
});

/** Flatten a ZodError into a field -> message map for form display. */
export function flattenZodErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
