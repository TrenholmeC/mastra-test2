import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { supabase } from "../lib/supabase";

const normalizeVehicleName = (value: string) => {
  return value
    .trim()
    .replace(/-/g, " ")
    .replace(/\s+/g, " ");
};

export const createVehicle = createTool({
  id: "create-vehicle",

  description: `
    Create a vehicle summary in the Supabase vehicles table.

    Before inserting, check whether a vehicle with the same make
    and model already exists.

    Make and model names must use their official/canonical vehicle
    names.

    Normalize make and model names by:
    - Removing leading/trailing whitespace
    - Replacing hyphens with spaces
    - Collapsing multiple spaces into one

    Use exact case-insensitive matching after normalization.

    Examples:
    - "F-150" becomes "F 150"
    - "RAV-4" becomes "RAV 4"
    - "  Toyota  " becomes "Toyota"

    If an existing vehicle with the same normalized make and model
    is found, do not create a duplicate. Return the existing vehicle.

    If no matching vehicle exists, insert the new vehicle.
  `,

  inputSchema: z.object({
    year: z
      .number()
      .int()
      .min(1900)
      .max(2100)
      .describe("Vehicle model year"),

    make: z
      .string()
      .min(1)
      .describe(
        "Official/canonical vehicle manufacturer name, e.g. Toyota, Ford, BMW"
      ),

    model: z
      .string()
      .min(1)
      .describe(
        "Official/canonical vehicle model name, e.g. RAV4, F 150, Civic"
      ),

    avg_price: z
      .number()
      .positive()
      .describe("Average vehicle price in CAD"),

    description: z
      .string()
      .min(1)
      .describe("Overall description of the vehicle"),
  }),

  outputSchema: z.object({
    success: z.boolean(),
    created: z.boolean(),
    vehicle: z.any().nullable(),
    error: z.string().nullable(),
  }),

  execute: async ({
    year,
    make,
    model,
    avg_price,
    description,
  }) => {
    const normalizedMake = normalizeVehicleName(make);
    const normalizedModel = normalizeVehicleName(model);

    const { data: existingVehicle, error: searchError } =
      await supabase
        .from("vehicles")
        .select("*")
        .ilike("make", normalizedMake)
        .ilike("model", normalizedModel)
        .eq("year", year)
        .limit(1)
        .maybeSingle();

    if (searchError) {
      return {
        success: false,
        created: false,
        vehicle: null,
        error: `Failed to check for existing vehicle: ${searchError.message}`,
      };
    }

    if (existingVehicle) {
      return {
        success: true,
        created: false,
        vehicle: existingVehicle,
        error: null,
      };
    }

    const { data: newVehicle, error: insertError } =
      await supabase
        .from("vehicles")
        .insert({
          year,
          make: normalizedMake,
          model: normalizedModel,
          avg_price,
          description,
        })
        .select()
        .single();

    if (insertError) {
      return {
        success: false,
        created: false,
        vehicle: null,
        error: `Failed to create vehicle: ${insertError.message}`,
      };
    }

    return {
      success: true,
      created: true,
      vehicle: newVehicle,
      error: null,
    };
  },
});