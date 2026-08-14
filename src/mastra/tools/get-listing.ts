import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { supabase } from "../lib/supabase";

export const getListing = createTool({
  id: "get-listing",

  description: `
    Retrieve a single vehicle listing by its ID.

    Use this tool when the user wants detailed information
    about a specific listing.

    The listing ID must be an exact ID from a previous search
    result or one explicitly provided by the user.

    Do not invent listing IDs.
  `,

  inputSchema: z.object({
    id: z
      .string()
      .min(1)
      .describe("The exact listing ID"),
  }),

  outputSchema: z.object({
    listing: z
      .object({
        id: z.string(),
        source: z.string(),
        title: z.string(),
        custom_title: z.string().nullable(),

        make: z.string().nullable(),
        model: z.string().nullable(),
        trim: z.string().nullable(),
        year: z.number().nullable(),

        mileage_km: z.number().nullable(),

        condition: z.string().nullable(),
        transmission: z.string().nullable(),
        fuel_type: z.string().nullable(),

        exterior_color: z.string().nullable(),
        interior_color: z.string().nullable(),

        price_amount: z.number(),
        price_currency: z.string(),

        seller_type: z.string().nullable(),
        dealership_name: z.string().nullable(),
        is_dealer: z.boolean().nullable(),

        seller_rating_avg: z.number().nullable(),
        seller_rating_count: z.number().nullable(),
        seller_verified: z.boolean().nullable(),

        location_text: z.string().nullable(),
        postal_code: z.string().nullable(),

        description: z.string().nullable(),
        vin: z.string().nullable(),
        title_status: z.string().nullable(),
        num_owners: z.number().nullable(),

        carfax_url: z.string().nullable(),

        is_live: z.boolean().nullable(),
        is_sold: z.boolean().nullable(),
        is_pending: z.boolean().nullable(),

        photo_url: z.string().nullable(),

        created_at: z.string(),
        first_seen_at: z.string(),
        last_seen_at: z.string(),
        sold_at: z.string().nullable(),

        vehicle_class: z.string(),
        is_parts: z.boolean(),
      })
      .nullable(),

    found: z.boolean(),
  }),

  execute: async ({ id }) => {
    const { data, error } = await supabase
      .from("listings")
      .select(`
        id,
        source,
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
        title_status,
        num_owners,
        carfax_url,
        is_live,
        is_sold,
        is_pending,
        photo_url,
        created_at,
        first_seen_at,
        last_seen_at,
        sold_at,
        vehicle_class,
        is_parts
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to retrieve listing: ${error.message}`);
    }

    if (!data) {
      return {
        found: false,
        listing: null,
      };
    }

    return {
      found: true,
      listing: data,
    };
  },
});