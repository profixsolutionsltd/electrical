"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/Icons";

export interface AccordionFaq {
  id: string;
  question: string;
  answer: string;
}

/** Accessible accordion FAQ list (single-open behaviour, keyboard friendly). */
export function FaqAccordion({ faqs }: { faqs: AccordionFaq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[rgb(var(--ayan-border))] overflow-hidden rounded-2xl border border-[rgb(var(--ayan-border))] bg-[rgb(var(--ayan-card))]">
      {faqs.map((faq, index) => {
        const open = openIndex === index;
        return (
          <div key={faq.id}>
            <h3>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                aria-expanded={open}
                aria-controls={`faq-panel-${faq.id}`}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-[rgb(var(--ayan-surface))]"
              >
                <span className="font-medium text-[rgb(var(--ayan-text))]">
                  {faq.question}
                </span>
                <Icons.chevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-[rgb(var(--ayan-muted))] transition-transform",
                    open && "rotate-180",
                  )}
                />
              </button>
            </h3>
            {open && (
              <div
                id={`faq-panel-${faq.id}`}
                className="px-6 pb-5 text-sm leading-relaxed text-[rgb(var(--ayan-muted))]"
              >
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

