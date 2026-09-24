// ---- the AI Trip Planner's connection to Groq ----
// Groq runs the LLM that turns a user's trip prompt into
// suggestions. We connect once here, then every file can
// import and use it.
import Groq from "groq-sdk";
import dotenv from "dotenv";

// load the keys from .env before we use them
dotenv.config({ path: ".env" });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default groq;
