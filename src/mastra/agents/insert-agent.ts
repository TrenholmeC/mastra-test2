import { Agent } from "@mastra/core/agent";
import { insertListing } from "../tools/insert-listing";
import { researchAgent } from './research-agent';

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
    Take information of the listing that the user wants to add and make sure
    it matches the fields taken by the insertListing tool and use the tool to
    add the listing to the database. The insertion may fail if the listing is already
    in the database.

    After inserting the listing use the researchAgent to get additional information about the 
    specific year, make and model and return the information to the user.
  `,

  memory,

  model: "google/gemini-3.5-flash-lite",

  tools: {
    insertListing
  },

  agents: {
    researchAgent
  }
});