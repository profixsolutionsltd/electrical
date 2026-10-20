import {
  parseServiceQuestions,
  priceWithAnswers,
  serialiseServiceQuestions,
  summariseAnswers,
  validateServiceAnswers,
  type ServiceQuestion,
} from "@/lib/service-questions";

const questions: ServiceQuestion[] = [
  {
    id: "appliance_count",
    label: "How many appliances do you have?",
    type: "number",
    required: true,
    min: 1,
    max: 20,
    basePrice: 1000,
    unitPrice: 500,
  },
  {
    id: "property_type",
    label: "What type of property is it?",
    type: "select",
    required: true,
    options: [
      { label: "Flat", priceDelta: 0 },
      { label: "House", priceDelta: 1500 },
      { label: "Commercial", priceDelta: 4000 },
    ],
  },
  {
    id: "has_gas",
    label: "Is there a gas supply?",
    type: "boolean",
    priceDelta: 2500,
  },
];

describe("Service questions", () => {
  it("parses stored JSON and ignores malformed entries", () => {
    const stored = JSON.stringify([
      ...questions,
      { nope: true },
      null,
      { id: "x" },
    ]);
    const parsed = parseServiceQuestions(stored);
    expect(parsed).toHaveLength(questions.length);
    expect(parsed[0].id).toBe("appliance_count");
  });

  it("returns an empty list for invalid JSON", () => {
    expect(parseServiceQuestions("{not json")).toEqual([]);
    expect(parseServiceQuestions(null)).toEqual([]);
    expect(parseServiceQuestions(JSON.stringify({ id: "x" }))).toEqual([]);
  });

  it("round-trips through serialisation", () => {
    expect(parseServiceQuestions(serialiseServiceQuestions(questions))).toEqual(questions);
  });

  it("prices a number question using base + per-unit", () => {
    const result = priceWithAnswers(6900, questions, { appliance_count: 3 });
    // 6900 base + 1000 base + (3 × 500) = 9400
    expect(result.total).toBe(9400);
    expect(result.adjustments).toHaveLength(1);
    expect(result.adjustments[0].label).toBe("How many appliances do you have? (3)");
  });

  it("does not charge the base price when the count is zero", () => {
    const result = priceWithAnswers(6900, questions, { appliance_count: 0 });
    expect(result.total).toBe(6900);
    expect(result.adjustments).toHaveLength(0);
  });

  it("applies the price delta of a selected option", () => {
    const result = priceWithAnswers(6900, questions, { property_type: "Commercial" });
    expect(result.total).toBe(10900);
    expect(result.adjustments[0].label).toBe("What type of property is it?: Commercial");
  });

  it("only charges a boolean question when answered yes", () => {
    expect(priceWithAnswers(6900, questions, { has_gas: true }).total).toBe(9400);
    expect(priceWithAnswers(6900, questions, { has_gas: false }).total).toBe(6900);
  });

  it("never prices below zero", () => {
    const credit: ServiceQuestion[] = [
      { id: "credit", label: "Account credit", type: "boolean", priceDelta: -5000 },
    ];
    const result = priceWithAnswers(100, credit, { credit: true });
    expect(result.total).toBe(0);
  });

  it("validates required, bounds and option answers", () => {
    expect(validateServiceAnswers(questions, {})).toEqual({
      appliance_count: "This answer is required",
      property_type: "This answer is required",
    });

    expect(validateServiceAnswers(questions, { appliance_count: 0 }).appliance_count).toBe(
      "Enter 1 or more",
    );
    expect(validateServiceAnswers(questions, { appliance_count: 99 }).appliance_count).toBe(
      "Enter 20 or less",
    );
    expect(validateServiceAnswers(questions, { property_type: "Castle" }).property_type).toBe(
      "Choose one of the options",
    );
    expect(
      validateServiceAnswers(questions, { appliance_count: 2, property_type: "Flat" }),
    ).toEqual({});
  });

  it("summarises answers for the engineer", () => {
    const lines = summariseAnswers(questions, {
      appliance_count: 2,
      property_type: "House",
      has_gas: true,
    });
    expect(lines).toEqual([
      "How many appliances do you have?: 2",
      "What type of property is it?: House",
      "Is there a gas supply?: Yes",
    ]);
  });
});
