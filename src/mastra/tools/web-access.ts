import { createBrightDataTools } from "@mastra/brightdata";

export const { webSearch, webFetch } = createBrightDataTools({
  verbose: true,
});