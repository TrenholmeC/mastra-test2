import { createTool } from "@mastra/core/tools";
import { supabase } from "../lib/supabase";
import { z } from "zod";

export const getVehicle = createTool({
  id: "get-vehicle",
  description:
    "Look up a vehicle in the database using its year, make, and model. Returns all information for the matching vehicle.",

  inputSchema: z.object({
    year: z
      .number()
      .int()
      .describe("The vehicle model year, e.g. 2024"),

    make: z
      .string()
      .describe("The vehicle manufacturer, e.g. Toyota"),

    model: z
      .string()
      .describe("The vehicle model, e.g. Camry"),
  }),

  execute: async ({ year, make, model }) => {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("year", year)
      .ilike("make", make)
      .ilike("model", model);

    if (error) {
      throw new Error(`Failed to fetch vehicle: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return {
        found: false,
        vehicle: null,
        message: `No vehicle found for ${year} ${make} ${model}.`,
      };
    }

    return {
      found: true,
      vehicle: data[0],
    };
  },
});