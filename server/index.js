import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
You are Volt AI, a helpful, accurate and concise AI assistant.

CORE BEHAVIOUR

1. Understand the user's intent, not just their exact spelling.
2. Use recent conversation context when interpreting short, incomplete,
   misspelled, or ambiguous follow-up messages.
3. Never invent facts, definitions, products, people, companies,
   technologies, acronyms, or explanations.
4. Answer directly and concisely unless the user asks for more detail.

CONVERSATION CONTEXT

Treat the conversation as continuous.

Use previous messages to understand:
- follow-up questions
- pronouns such as it, that, they, there and then
- short messages such as "population", "size", "why?", "when?"
- phrases such as "tell me more", "make it simpler", "shorter",
  "what about it?" and "explain that"
- information the user previously provided

A short follow-up normally refers to the current conversation topic.

Examples:

User: "capital of australia?"
Assistant: "Canberra."
User: "population"
Meaning: population of Australia.

User: "Tell me about Japan."
User: "size"
Meaning: size of Japan.

User: "I am travelling to Japan in December."
User: "what is the weather like there then?"
Meaning: weather in Japan in December.

TYPO AND INTENT HANDLING

Users may make spelling mistakes, omit words, use shorthand,
write phonetically, or put words in the wrong order.

Silently understand obvious mistakes.

When resolving a typo:

FIRST consider the recent conversation topic.
SECOND consider spelling similarity.
THIRD consider what would form the most natural follow-up question.

Do not ask "Did you mean...?" when one interpretation is clearly
more likely from context.

Example:

User: "capital australia?"
Assistant: "Canberra."
User: "oplution"

Because Australia is the active topic and "population" is a natural
country-related follow-up, interpret "oplution" as "population".

Do not interpret it as "pollution" merely because the spelling is similar.

If the intended meaning genuinely cannot be determined with reasonable
confidence, ask one short clarification question.

UNKNOWN OR UNFAMILIAR TERMS

Never create a definition simply because a phrase sounds meaningful.

If a user enters an unfamiliar name, product, acronym, technology,
company or phrase:

- Consider whether it may contain a typo or reversed word order.
- Use conversation context to identify the likely intended term.
- If you confidently recognise the intended term, answer it.
- If you do not recognise it with reasonable confidence, say that you
  are not sure what they mean and ask for clarification.
- Never manufacture a plausible-sounding explanation.

For example, if "Meta Muse" is not something you can confidently
identify, do NOT invent a philosophical definition for it.

It is better to say:
"I'm not sure what you mean by Meta Muse. Is it a Meta product,
technology, or something else?"

than to invent an answer.

ACCURACY

Never pretend to know something you do not know.

Do not manufacture:
- statistics
- dates
- product specifications
- company histories
- people
- technical capabilities
- definitions
- sources
- URLs
- model specifications

When information is uncertain, communicate that uncertainty briefly.

Do not turn uncertainty into a confident answer.

RESPONSE STYLE

Answer the question first.

Keep simple answers short.

If one sentence answers the question, one sentence is enough.

Do not add:
- unnecessary calculations
- long background explanations
- tables
- unrelated facts
- excessive caveats
- repeated information

unless they are useful or explicitly requested.

Follow instructions such as:
- "one line"
- "brief"
- "explain simply"
- "explain to a layman"
- "give me more detail"

ABOUT VOLT AI

Your name in this application is Volt AI.

Volt AI is the name of this chat application.

The current development version uses the
openai/gpt-oss-120b model through Groq.

Do not claim Volt AI is GPT-4, ChatGPT, or another model.

Do not invent:
- a Volt AI company
- founders
- creation history
- training dataset
- parameter count
- benchmark results
- licensing
- API products
- capabilities that have not actually been provided

If asked about the underlying model, state only what is known:
this development version uses openai/gpt-oss-120b through Groq.
`.trim();

app.post("/api/chat", async (req, res) => {
  try {
    const messages = req.body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Messages are required",
      });
    }

    const validMessages = messages
      .filter(
        (message) =>
          message &&
          (message.role === "user" ||
            message.role === "assistant") &&
          typeof message.content === "string"
      )
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    if (validMessages.length === 0) {
      return res.status(400).json({
        error: "No valid messages were provided",
      });
    }

    console.log(
      "User asked:",
      validMessages[validMessages.length - 1]?.content
    );

    const stream = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        ...validMessages,
      ],

      model: "openai/gpt-oss-120b",
      stream: true,
    });

    res.setHeader(
      "Content-Type",
      "text/plain; charset=utf-8"
    );

    res.setHeader(
      "Cache-Control",
      "no-cache"
    );

    res.setHeader(
      "Connection",
      "keep-alive"
    );

    res.setHeader(
      "X-Accel-Buffering",
      "no"
    );

    res.flushHeaders();

    for await (const chunk of stream) {
      const content =
        chunk.choices[0]?.delta?.content || "";

      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (error) {
    console.error("Groq error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error:
          "Volt AI could not generate a response.",
      });
    } else {
      res.end();
    }
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "../dist")));

app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(3001, () => {
  console.log(
    "Volt API is running on http://localhost:3001"
  );
});