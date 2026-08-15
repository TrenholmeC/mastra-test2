import { createTool } from "@mastra/core/tools";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const googleAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export const webResearch = createTool({
  id: "web-research",
  description:
    "Search the web using Google and return a concise, factual summary answering the user's question. Use this for current or externally verifiable information.",

  inputSchema: z.object({
    query: z
      .string()
      .describe("The question or search query that should be researched on the web"),
  }),

  execute: async ({ query }) => {
    const response = await googleAI.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: `
Search the web to answer this question:

${query}

Instructions:
- Search Google for current and relevant information.
- Synthesize the most useful information from the search results.
- Answer the question directly.
- Be concise but sufficiently detailed.
- Prefer authoritative and primary sources.
- Mention uncertainty when sources disagree.
- Include source URLs when available.
      `,
      config: {
        tools: [
          {
            googleSearch: {},
          },
        ],
      },
    });

    return {
      query,
      summary: response.text,
    };
  },
});