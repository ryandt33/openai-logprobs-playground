import { Message } from "../../resources/types";

export const getModels = async (
  apiKey: string
): Promise<{ id: string }[] | boolean> => {
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const { data } = await res.json();

    const gptModels = data.filter(
      (model: { id: string }) =>
        model.id.includes("gpt") && !model.id.includes("vision")
    );

    return gptModels;
  } catch (error) {
    console.error(error);

    return false;
  }
};

export const inference = async (
  messages: Message[],
  apiKey: string,
  model: string,
  logprobs: boolean = false
) => {
  const body = JSON.stringify({
    max_tokens: logprobs ? 5 : 4096,
    messages,
    model,
    temperature: 0,
    logprobs: true,
    stream: false,
    top_logprobs: 5,
  });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body,
  });
  try {
    const json = await res.json();

    return json;
  } catch (error) {
    console.error(error);

    throw new Error("Failed to generate response");
  }
};

export const verifyApiKey = async (apiKey: string) => {
  const models = await getModels(apiKey);

  if (models) {
    return models;
  } else {
    return false;
  }
};
