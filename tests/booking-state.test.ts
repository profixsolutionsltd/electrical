import {
  canTransition,
  isTerminalStatus,
  canBeCancelled,
  bookingProgress,
} from "@/lib/booking";
import { BOOKING_STATUS } from "@/lib/constants";

describe("Booking Lifecycle State Machine", () => {
  it("permits standard forward progression", () => {
    expect(canTransition(BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED)).toBe(true);
    expect(canTransition(BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.ASSIGNED)).toBe(true);
    expect(canTransition(BOOKING_STATUS.ASSIGNED, BOOKING_STATUS.IN_PROGRESS)).toBe(true);
    expect(canTransition(BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.COMPLETED)).toBe(true);
  });

  it("permits unassigning an assigned job back to confirmed pool", () => {
    expect(canTransition(BOOKING_STATUS.ASSIGNED, BOOKING_STATUS.CONFIRMED)).toBe(true);
  });

  it("prevents illegal backward or skipping transitions", () => {
    expect(canTransition(BOOKING_STATUS.PENDING, BOOKING_STATUS.COMPLETED)).toBe(false);
    expect(canTransition(BOOKING_STATUS.COMPLETED, BOOKING_STATUS.IN_PROGRESS)).toBe(false);
    expect(canTransition(BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED)).toBe(false);
  });

  it("identifies terminal statuses", () => {
    expect(isTerminalStatus(BOOKING_STATUS.COMPLETED)).toBe(true);
    expect(isTerminalStatus(BOOKING_STATUS.CANCELLED)).toBe(true);
    expect(isTerminalStatus(BOOKING_STATUS.IN_PROGRESS)).toBe(false);
    expect(isTerminalStatus(BOOKING_STATUS.CONFIRMED)).toBe(false);
  });

  it("permits cancellation from pre-completion states only", () => {
    expect(canBeCancelled(BOOKING_STATUS.PENDING)).toBe(true);
    expect(canBeCancelled(BOOKING_STATUS.CONFIRMED)).toBe(true);
    expect(canBeCancelled(BOOKING_STATUS.ASSIGNED)).toBe(true);
    expect(canBeCancelled(BOOKING_STATUS.IN_PROGRESS)).toBe(true);
    expect(canBeCancelled(BOOKING_STATUS.COMPLETED)).toBe(false);
    expect(canBeCancelled(BOOKING_STATUS.CANCELLED)).toBe(false);
  });

  it("calculates progress percentages correctly", () => {
    expect(bookingProgress(BOOKING_STATUS.PENDING)).toBe(20);
    expect(bookingProgress(BOOKING_STATUS.CONFIRMED)).toBe(40);
    expect(bookingProgress(BOOKING_STATUS.ASSIGNED)).toBe(60);
    expect(bookingProgress(BOOKING_STATUS.IN_PROGRESS)).toBe(80);
    expect(bookingProgress(BOOKING_STATUS.COMPLETED)).toBe(100);
    expect(bookingProgress(BOOKING_STATUS.CANCELLED)).toBe(0);
  });
});

