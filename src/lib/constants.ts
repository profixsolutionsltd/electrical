/**
 * AYAN domain constants. Kept framework-free and DB-free so they can be shared
 * across server code, tests and (safe) client code.
 *
 * Roles and statuses are stored as plain strings in the database (rather than
 * database enums) to keep the schema portable across SQLite and PostgreSQL.
 */

export const ROLES = {
  CUSTOMER: "CUSTOMER",
  ENGINEER: "ENGINEER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = [ROLES.CUSTOMER, ROLES.ENGINEER, ROLES.ADMIN];

/** Human-friendly role labels. */
export const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: "Customer",
  ENGINEER: "Engineer",
  ADMIN: "Administrator",
};

/** The lifecycle of a booking / job. */
export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const BOOKING_STATUSES: BookingStatus[] = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.ASSIGNED,
  BOOKING_STATUS.IN_PROGRESS,
  BOOKING_STATUS.COMPLETED,
  BOOKING_STATUS.CANCELLED,
];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

/** Statuses considered "active" (not yet terminal). */
export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.ASSIGNED,
  BOOKING_STATUS.IN_PROGRESS,
];

export const PAYMENT_STATUS = {
  UNPAID: "UNPAID",
  PENDING: "PENDING",
  PAID: "PAID",
  REFUNDED: "REFUNDED",
  FAILED: "FAILED",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  PENDING: "Pending",
  PAID: "Paid",
  REFUNDED: "Refunded",
  FAILED: "Failed",
};

export const PAYMENT_METHOD = {
  PAY_LATER: "PAY_LATER",
  CARD: "CARD",
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PAY_LATER: "Pay on completion",
  CARD: "Card payment",
};

/** Engineer application verification lifecycle. */
export const ENGINEER_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  SUSPENDED: "SUSPENDED",
} as const;

export type EngineerStatus =
  (typeof ENGINEER_STATUS)[keyof typeof ENGINEER_STATUS];

export const ENGINEER_STATUS_LABELS: Record<EngineerStatus, string> = {
  PENDING: "Pending review",
  APPROVED: "Approved",
  SUSPENDED: "Suspended",
};

/** Support ticket lifecycle. */
export const TICKET_STATUS = {
  OPEN: "OPEN",
  PENDING: "PENDING",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Open",
  PENDING: "Awaiting reply",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

/** Default VAT rate used across the platform (percentage). */
export const DEFAULT_VAT_RATE = 20;

/** Number of days before an appointment that cancellation remains free. */
export const DEFAULT_CANCELLATION_WINDOW_HOURS = 24;

/** Booking reference configuration. */
export const BOOKING_REFERENCE_PREFIX = "AYN";
