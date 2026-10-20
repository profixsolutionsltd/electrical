"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimeWindow } from "@/lib/slots";
import type { ServiceAnswers, ServiceQuestion } from "@/lib/service-questions";

/**
 * Client-side booking journey state. Persisted to localStorage so a customer
 * never loses progress when moving between steps, refreshing the page or
 * navigating backwards. The final submission is always re-validated and
 * re-priced on the server.
 */

export interface BookingDraftService {
  id: string;
  name: string;
  summary?: string;
  priceFrom: number;
  vatApplicable: boolean;
  durationMinutes: number;
  questions?: ServiceQuestion[];
}

export interface BookingDraft {
  services: BookingDraftService[];

  // Property
  postcode: string;
  coverageConfirmed: boolean;
  addressLine1: string;
  addressLine2: string;
  city: string;
  propertyType: string;
  bedrooms: string;

  // Job questions, keyed by service id
  answers: Record<string, ServiceAnswers>;

  // Appointment
  scheduledDate: string;
  timeWindow: TimeWindow;

  // Customer
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  notes: string;
  accessNotes: string;

  // Payment
  paymentMethod: "PAY_LATER" | "CARD";
  discountCode: string;

  // Flow position
  step: number;
}

const emptyDraft: BookingDraft = {
  services: [],
  postcode: "",
  coverageConfirmed: false,
  addressLine1: "",
  addressLine2: "",
  city: "",
  propertyType: "",
  bedrooms: "",
  answers: {},
  scheduledDate: "",
  timeWindow: "MORNING",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  notes: "",
  accessNotes: "",
  paymentMethod: "PAY_LATER",
  discountCode: "",
  step: 0,
};

interface BookingStore {
  draft: BookingDraft;
  setServices: (services: BookingDraftService[]) => void;
  toggleService: (service: BookingDraftService) => void;
  setAnswers: (serviceId: string, answers: ServiceAnswers) => void;
  updateDetails: (patch: Partial<BookingDraft>) => void;
  setStep: (step: number) => void;
  reset: () => void;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set) => ({
      draft: emptyDraft,
      setServices: (services) =>
        set((s) => ({ draft: { ...s.draft, services, answers: {} } })),
      toggleService: (service) =>
        set((s) => {
          const exists = s.draft.services.find((x) => x.id === service.id);
          const services = exists
            ? s.draft.services.filter((x) => x.id !== service.id)
            : [...s.draft.services, service];
          const answers = { ...s.draft.answers };
          if (exists) delete answers[service.id];
          return { draft: { ...s.draft, services, answers } };
        }),
      setAnswers: (serviceId, serviceAnswers) =>
        set((s) => ({
          draft: {
            ...s.draft,
            answers: { ...s.draft.answers, [serviceId]: serviceAnswers },
          },
        })),
      updateDetails: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
      setStep: (step) => set((s) => ({ draft: { ...s.draft, step } })),
      reset: () => set({ draft: emptyDraft }),
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: "ayan-booking-draft",
      version: 2,
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
