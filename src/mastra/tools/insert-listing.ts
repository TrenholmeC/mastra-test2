import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { supabase } from "../lib/supabase";

const createListingInput = z.object({
  title: z
    .string()
    .describe("Listing title. Only provide if explicitly known."),

  custom_title: z
    .string()
    .optional()
    .describe("Custom listing title, only if explicitly provided."),

  make: z
    .string()
    .describe("Vehicle manufacturer, e.g. Toyota, Honda, Ford"),

  model: z
    .string()
    .describe("Vehicle model, e.g. RAV4, Civic, F-150"),

  trim: z
    .string()
    .optional()
    .describe("Vehicle trim, only if explicitly known."),

  year: z
    .number()
    .int()
    .describe("Vehicle model year"),

  mileage_km: z
    .number()
    .int()
    .optional()
    .describe("Vehicle mileage in kilometres, only if explicitly known."),

  condition: z
    .string()
    .optional()
    .describe("Vehicle condition, only if explicitly known."),

  transmission: z
    .string()
    .optional()
    .describe("Transmission type, only if explicitly known."),

  fuel_type: z
    .string()
    .optional()
    .describe("Fuel type, only if explicitly known."),

  exterior_color: z
    .string()
    .optional()
    .describe("Exterior vehicle color, only if explicitly known."),

  interior_color: z
    .string()
    .optional()
    .describe("Interior vehicle color, only if explicitly known."),

  price_amount: z
    .number()
    .optional()
    .describe("Vehicle listing price in CAD, only if explicitly known."),

  price_currency: z
    .string()
    .optional()
    .describe("Listing currency, e.g. CAD, only if explicitly known."),

  seller_type: z
    .string()
    .optional()
    .describe("Seller type, only if explicitly known."),

  dealership_name: z
    .string()
    .optional()
    .describe("Dealership name, only if explicitly known."),

  is_dealer: z
    .boolean()
    .optional()
    .describe("Whether the seller is a dealer, only if explicitly known."),

  seller_rating_avg: z
    .number()
    .optional()
    .describe("Seller rating average, only if explicitly known."),

  seller_rating_count: z
    .number()
    .int()
    .optional()
    .describe("Number of seller ratings, only if explicitly known."),

  seller_verified: z
    .boolean()
    .optional()
    .describe("Whether the seller is verified, only if explicitly known."),

  location_text: z
    .string()
    .optional()
    .describe("Listing location, only if explicitly known."),

  postal_code: z
    .string()
    .optional()
    .describe("Listing postal code, only if explicitly known."),

  description: z
    .string()
    .optional()
    .describe("Vehicle listing description, only if explicitly known."),

  vin: z
    .string()
    .optional()
    .describe("Vehicle VIN, only if explicitly known."),

  is_live: z
    .boolean()
    .optional()
    .describe("Whether the listing is currently live, only if explicitly known."),

  is_sold: z
    .boolean()
    .optional()
    .describe("Whether the listing is sold, only if explicitly known."),

  is_pending: z
    .boolean()
    .optional()
    .describe("Whether the listing is pending, only if explicitly known."),

  photo_url: z
    .string()
    .optional()
    .describe("Primary listing photo URL, only if explicitly known."),

  vehicle_class: z
    .string()
    .optional()
    .describe("Vehicle class, e.g. car, truck, SUV, only if explicitly known."),
});

export const insertListing = createTool({
  id: "insert-listing",

  description: `
    Create exactly one vehicle listing in the Supabase listings database.

    IMPORTANT:
    - Only insert information that is explicitly provided to the agent.
    - Never invent, estimate, infer, or fabricate listing information.
    - If a field is not known, omit it.
    - Do not make up a price, mileage, VIN, location, seller information,
      condition, or any other missing value.
    - Database-generated fields such as id and created_at are handled
      automatically by Supabase.
    - This tool creates exactly one listing.
  `,

  inputSchema: createListingInput,

  execute: async (input) => {
    // Build the insert object while excluding undefined values.
    // This ensures we don't send unknown fields as fabricated values.
    const listing = Object.fromEntries(
      Object.entries(input).filter(
        ([_, value]) => value !== undefined
      )
    );

    const { data, error } = await supabase
      .from("listings")
      .insert(listing)
      .select(`
        id,
        title,
        custom_title,
        make,
        model,
        trim,
        year,
        mileage_km,
        condition,
        transmission,
        fuel_type,
        exterior_color,
        interior_color,
        price_amount,
        price_currency,
        seller_type,
        dealership_name,
        is_dealer,
        seller_rating_avg,
        seller_rating_count,
        seller_verified,
        location_text,
        postal_code,
        description,
        vin,
        is_live,
        is_sold,
        is_pending,
        photo_url,
        created_at,
        first_seen_at,
        last_seen_at,
        vehicle_class
      `)
      .single();

    if (error) {
      throw new Error(
        `Failed to create listing: ${error.message}`
      );
    }

    return {
      success: true,
      listing: data,
    };
  },
});