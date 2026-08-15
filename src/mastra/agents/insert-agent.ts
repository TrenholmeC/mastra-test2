import { Agent } from "@mastra/core/agent";
import { insertListing } from "../tools/insert-listing";

import { Memory } from "@mastra/memory";

export const memory = new Memory({
  options: {
    lastMessages: 20,
  },
});

export const insertAgent = new Agent({
  id: "insert-agent",

  name: "Insert Agent",

  instructions: `
    Take information of the listing that the user wants to add and sperate everything
    into the seperate fields taken by the insertListing tool and use the tool to
    add the listing to the database.

    Let the user know if the insertion was successful or not.
  `,

  memory,

  model: "google/gemini-3.5-flash-lite",

  tools: {
    insertListing
  },
});