import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { supabase } from "../lib/supabase";

const queryListingsInput = z.object({
  make: z
    .string()
    .optional()
    .describe("Vehicle manufacturer, e.g. Toyota, Honda, Ford"),

  model: z
    .string()
    .optional()
    .describe("Vehicle model, e.g. RAV4, Civic, F-150"),

  trim: z
    .string()
    .optional()
    .describe("Vehicle trim"),

  year_min: z
    .number()
    .int()
    .optional()
    .describe("Minimum vehicle model year"),

  year_max: z
    .number()
    .int()
    .optional()
    .describe("Maximum vehicle model year"),

  price_min: z
    .number()
    .optional()
    .describe("Minimum price in CAD"),

  price_max: z
    .number()
    .optional()
    .describe("Maximum price in CAD"),

  mileage_min: z
    .number()
    .int()
    .optional()
    .describe("Minimum mileage in kilometres"),

  mileage_max: z
    .number()
    .int()
    .optional()
    .describe("Maximum mileage in kilometres"),

  condition: z
    .string()
    .optional()
    .describe("Vehicle condition"),

  transmission: z
    .string()
    .optional()
    .describe("Transmission type, e.g. automatic or manual"),

  fuel_type: z
    .string()
    .optional()
    .describe("Fuel type, e.g. gas, diesel, hybrid, electric"),

  exterior_color: z
    .string()
    .optional()
    .describe("Exterior vehicle color"),

  seller_type: z
    .string()
    .optional()
    .describe("Seller type"),

  is_dealer: z
    .boolean()
    .optional()
    .describe("Whether the seller is a dealer"),

  vehicle_class: z
    .string()
    .optional()
    .describe("Vehicle class, e.g. car, truck, SUV"),

  is_live: z
    .boolean()
    .optional()
    .describe("Only return currently live listings"),

  is_sold: z
    .boolean()
    .optional()
    .describe("Whether the listing is sold"),

  is_pending: z
    .boolean()
    .optional()
    .describe("Whether the listing is pending"),

  location: z
    .string()
    .optional()
    .describe("Text search against the listing location"),

  search: z
    .string()
    .optional()
    .describe("General text search against title, make, model, description, or dealership"),

  sort_by: z
    .enum([
      "price_amount",
      "year",
      "mileage_km",
      "created_at",
      "first_seen_at",
      "last_seen_at",
    ])
    .default("created_at")
    .describe("Field to sort results by"),

  sort_direction: z
    .enum(["asc", "desc"])
    .default("desc")
    .describe("Sort direction"),

  limit: z
    .number()
    .int()
    .min(1)
    .max(50)
    .default(20)
    .describe("Maximum number of listings to return"),
});

export const queryListings = createTool({
  id: "query-listings",

  description: `
    Search and filter vehicle listings in the Supabase listings database.

    Use this tool whenever the user asks to find, search, compare,
    filter, or inspect vehicle listings.

    All prices are CAD and all mileage values are kilometres.

    Only use filters that are relevant to the user's request.
    Do not invent filters or values.

    Results are limited to 50 listings maximum.
  `,

  inputSchema: queryListingsInput,

  execute: async (input) => {
    let query = supabase
      .from("listings")
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
      `);

    if (input.make) {
      query = query.ilike("make", `%${input.make}%`);
    }

    if (input.model) {
      query = query.ilike("model", `%${input.model}%`);
    }

    if (input.trim) {
      query = query.ilike("trim", `%${input.trim}%`);
    }

    if (input.year_min !== undefined) {
      query = query.gte("year", input.year_min);
    }

    if (input.year_max !== undefined) {
      query = query.lte("year", input.year_max);
    }

    if (input.price_min !== undefined) {
      query = query.gte("price_amount", input.price_min);
    }

    if (input.price_max !== undefined) {
      query = query.lte("price_amount", input.price_max);
    }

    if (input.mileage_min !== undefined) {
      query = query.gte("mileage_km", input.mileage_min);
    }

    if (input.mileage_max !== undefined) {
      query = query.lte("mileage_km", input.mileage_max);
    }

    if (input.condition) {
      query = query.ilike("condition", `%${input.condition}%`);
    }

    if (input.transmission) {
      query = query.ilike("transmission", `%${input.transmission}%`);
    }

    if (input.fuel_type) {
      query = query.ilike("fuel_type", `%${input.fuel_type}%`);
    }

    if (input.exterior_color) {
      query = query.ilike(
        "exterior_color",
        `%${input.exterior_color}%`
      );
    }

    if (input.seller_type) {
      query = query.ilike("seller_type", `%${input.seller_type}%`);
    }

    if (input.is_dealer !== undefined) {
      query = query.eq("is_dealer", input.is_dealer);
    }

    if (input.vehicle_class) {
      query = query.eq("vehicle_class", input.vehicle_class);
    }

    if (input.is_live !== undefined) {
      query = query.eq("is_live", input.is_live);
    }

    if (input.is_sold !== undefined) {
      query = query.eq("is_sold", input.is_sold);
    }

    if (input.is_pending !== undefined) {
      query = query.eq("is_pending", input.is_pending);
    }

    if (input.location) {
      query = query.ilike(
        "location_text",
        `%${input.location}%`
      );
    }

    if (input.search) {
      query = query.or(
        [
          `title.ilike.%${input.search}%`,
          `make.ilike.%${input.search}%`,
          `model.ilike.%${input.search}%`,
          `description.ilike.%${input.search}%`,
          `dealership_name.ilike.%${input.search}%`,
        ].join(",")
      );
    }

    query = query
      .order(input.sort_by, {
        ascending: input.sort_direction === "asc",
      })
      .limit(input.limit);

    const { data, error } = await query;

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`);
    }

    return {
      count: data?.length ?? 0,
      listings: data ?? [],
    };
  },
});