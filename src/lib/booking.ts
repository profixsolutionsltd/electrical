import {
  BOOKING_STATUS,
  type BookingStatus,
} from "./constants";

/**
 * The set of legal booking-status transitions. This is the single source of
 * truth enforced both in the UI (which buttons to show) and on the server
 * (which transitions to accept). Any transition not listed here is rejected.
 */
export const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BOOKING_STATUS.PENDING]: [
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.CANCELLED,
  ],
  [BOOKING_STATUS.CONFIRMED]: [
    BOOKING_STATUS.ASSIGNED,
    BOOKING_STATUS.CANCELLED,
  ],
  [BOOKING_STATUS.ASSIGNED]: [
    BOOKING_STATUS.IN_PROGRESS,
    BOOKING_STATUS.CANCELLED,
    BOOKING_STATUS.CONFIRMED, // un-assign back to confirmed
  ],
  [BOOKING_STATUS.IN_PROGRESS]: [
    BOOKING_STATUS.COMPLETED,
    BOOKING_STATUS.CANCELLED,
  ],
  [BOOKING_STATUS.COMPLETED]: [], // terminal
  [BOOKING_STATUS.CANCELLED]: [], // terminal
};

/** Whether a transition from `from` to `to` is permitted. */
export function canTransition(
  from: BookingStatus,
  to: BookingStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Whether a status is terminal (no further transitions). */
export function isTerminalStatus(status: BookingStatus): boolean {
  return ALLOWED_TRANSITIONS[status]?.length === 0;
}

/** The statuses a booking can be cancelled from. */
export function canBeCancelled(status: BookingStatus): boolean {
  return ALLOWED_TRANSITIONS[status]?.includes(BOOKING_STATUS.CANCELLED) ?? false;
}

/** A rough ordering used for progress/timeline rendering. */
export const STATUS_ORDER: BookingStatus[] = [
  BOOKING_STATUS.PENDING,
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.ASSIGNED,
  BOOKING_STATUS.IN_PROGRESS,
  BOOKING_STATUS.COMPLETED,
];

/** Percentage (0-100) progress of a booking through its happy path. */
export function bookingProgress(status: BookingStatus): number {
  const index = STATUS_ORDER.indexOf(status);
  if (index === -1) return 0; // cancelled
  return Math.round(((index + 1) / STATUS_ORDER.length) * 100);
}
