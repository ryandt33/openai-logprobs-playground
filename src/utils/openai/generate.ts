import { Store } from "../../context/storeContext";
import { Logprob, Role } from "../../resources/types";
import { inference } from "./call";

interface TokenInfo {
  token: string;
  logprob: number;
}

interface TokenLikelihood {
  token: string;
  likelihood: number;
}

export function calculateTokenLikelihoods(
  tokenInfos: TokenInfo[]
): TokenLikelihood[] {
  // Convert logprobs to probabilities
  const probabilities = tokenInfos.map((info) => Math.exp(info.logprob));

  // Calculate the sum of all probabilities
  const totalProbability = probabilities.reduce((sum, prob) => sum + prob, 0);

  // Calculate the likelihood percentages
  return tokenInfos.map((info, index) => ({
    token: info.token,
    likelihood: (probabilities[index] / totalProbability) * 100,
  }));
}

const logProbGenerate = async ({ messages, apiKey, selectedModel }: Store) => {
  try {
    if (!messages || !Array.isArray(messages) || !apiKey || !selectedModel) {
      throw new Error("Missing fields");
    }
    const responses = await Promise.all(
      new Array(1).fill(null).map(async (_) => {
        const json = await inference(messages, apiKey, selectedModel, true);

        return json.choices[0].logprobs.content;
      })
    );

    const numOfTokens = responses[0].length;

    const mergedTokenLogprobs = new Array(numOfTokens)
      .fill(null)
      .map((_, i) => {
        return responses.reduce(
          (
            acc: {
              token: string;
              logprobs: number[];
            }[],
            response: Logprob[]
          ) => {
            const top_logprobs = response[i].top_logprobs;

            if (!top_logprobs) {
              return acc;
            }
            for (const logprob of top_logprobs) {
              const token = logprob.token;

              const existingToken = acc.find((l) => l.token === token);
              if (!existingToken) {
                acc.push({ token, logprobs: [logprob.logprob] });
              } else {
                existingToken.logprobs.push(logprob.logprob);
              }
            }

            return acc;
          },

          [] as { token: string; logprobs: number[] }[]
        );
      });

    console.log(mergedTokenLogprobs);

    const averageTokenLogprobs = mergedTokenLogprobs.map(
      (token: { token: string; logprobs: number[] }[]) => {
        return token.map((t) => {
          const averageLogprob =
            t.logprobs.reduce((acc, logprob) => acc + logprob, 0) /
            t.logprobs.length;

          return { token: t.token, logprob: averageLogprob };
        });
      }
    );

    const tokenLikelihoods = averageTokenLogprobs.map((token) => {
      const likelihoods = calculateTokenLikelihoods(token);

      return likelihoods.sort((a, b) => b.likelihood - a.likelihood);
    });

    const content = tokenLikelihoods
      .map((likelihoods) => likelihoods[0].token)
      .join("");

    console.log({
      mergedTokenLogprobs,
      averageTokenLogprobs,
      tokenLikelihoods,
    });
    return {
      role: Role.ASSISTANT,
      content,
      tokenLogprobs: averageTokenLogprobs,
      tokenLikelihoods: tokenLikelihoods,
      showGraph: true,
    };
  } catch (error) {
    console.error(error);
  }
};

export const generate = async (
  { messages, apiKey, selectedModel }: Store,
  logprobs: boolean
) => {
  const nullCheck = () => !messages?.every((m) => m.content);

  if (nullCheck()) {
    throw new Error("Please fill all the messages");
  }

  if (!messages || !Array.isArray(messages) || !apiKey || !selectedModel) {
    throw new Error("Missing fields");
  }

  try {
    if (!logprobs) {
      const json = await inference(messages, apiKey, selectedModel, false);

      console.log({ json });

      return {
        role: Role.ASSISTANT,
        content: json.choices[0].message.content,
        tokenLogprobs: json.choices[0].logprobs.content,
        showPercent: true,
      };
    } else {
      return await logProbGenerate({ messages, apiKey, selectedModel });
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error generating message");
  }
};
