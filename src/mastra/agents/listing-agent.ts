import { Agent } from "@mastra/core/agent";
import { getListing } from "../tools/get-listing";

export const listingsAgent = new Agent({
  id: "listings-agent",

  name: "Listings Agent",

  instructions: `
    You are a vehicle listings assistant.

    You can search vehicle listings and retrieve individual listings.

    When a user asks about a specific listing, use the get-listing
    tool with the exact listing ID.

    Never invent listing IDs.

    When presenting listing information:
    - Clearly identify the vehicle.
    - Show the price and mileage.
    - Include relevant vehicle specifications.
    - Include seller and location information when available.
    - Do not claim information that isn't present in the listing.
  `,

  model: "google/gemini-3.5-flash-lite",

  tools: {
    getListing,
  },
});