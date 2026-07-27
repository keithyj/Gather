import { describe, expect, it } from "vitest";
import { housewarmingSchema } from "./event-schema";

const validEvent = {
  title: "New keys, old friends",
  date: "2026-09-12",
  startTime: "19:00",
  endTime: "22:00",
  timezone: "Europe/London",
  broadArea: "Hackney, East London",
  exactAddress: "12 Example Street, London E8 1AA",
  description: "Dinner, introductions, and a toast to a new home.",
  capacity: 14,
  plusOnePolicy: "selected" as const,
  alcoholPresent: true,
  dietaryCollection: true,
  accessibilityNote: "Please let me know what would make arrival easier."
};

describe("housewarmingSchema", () => {
  it("accepts a complete housewarming", () => {
    expect(housewarmingSchema.safeParse(validEvent).success).toBe(true);
  });

  it("requires a broad area and does not treat an address as one", () => {
    const result = housewarmingSchema.safeParse({ ...validEvent, broadArea: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors.broadArea).toBeTruthy();
  });

  it("rejects an end time before the start", () => {
    const result = housewarmingSchema.safeParse({ ...validEvent, endTime: "18:30" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.flatten().fieldErrors.endTime).toContain("End time must be after the start time.");
  });
});
