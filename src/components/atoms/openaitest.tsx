import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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",
});

const completion = openai.chat.completions.create({
  model: "gpt-4o-mini",
  store: true,
  messages: [
    {"role": "user", "content": "write a haiku about ai"},
  ],
});

completion.then((result) => console.log(result.choices[0].message));