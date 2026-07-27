import { z } from "zod";

const housewarmingFields = z.object({
  title: z.string().trim().min(3, "Use at least 3 characters.").max(80),
  date: z.string().min(1, "Choose a date."),
  startTime: z.string().min(1, "Choose a start time."),
  endTime: z.string().optional(),
  timezone: z.string().min(1, "Choose a timezone."),
  broadArea: z.string().trim().min(2, "Add a neighbourhood or broad area.").max(80),
  exactAddress: z.string().trim().min(8, "Add the full address for the host record.").max(240),
  description: z.string().trim().min(12, "Share a little more context.").max(500),
  eventType: z.literal("housewarming"),
  dressCode: z.string().trim().max(120).optional(),
  foodAndDrinkNotes: z.string().trim().max(500).optional(),
  entryInstructions: z.string().trim().max(500).optional(),
  hostContact: z.string().trim().max(160).optional(),
  capacity: z.coerce.number().int().min(2, "Capacity must be at least 2.").max(100),
  plusOnePolicy: z.enum(["none", "selected", "all"]),
  alcoholPresent: z.boolean(),
  dietaryCollection: z.boolean(),
  accessibilityNote: z.string().trim().max(240).optional()
});

export const housewarmingSchema = housewarmingFields.refine(
  (data) => !data.endTime || data.endTime > data.startTime,
  {
    path: ["endTime"],
    message: "End time must be after the start time."
  }
);

export type HousewarmingInput = z.infer<typeof housewarmingSchema>;

export const previewSchema = housewarmingFields.omit({ exactAddress: true });
export type EventPreview = z.infer<typeof previewSchema> & { id: string; hostName: string };
