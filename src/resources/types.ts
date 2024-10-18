export enum Variant {
  PRIMARY = "primary",
  SECONDARY = "secondary",
}

export enum Role {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export interface Logprob {
  token: string;
  logprob: number;
  top_logprobs?: Logprob[];
}

export interface Message {
  content: string;
  role: Role;
  tokenLogprobs?: Logprob[];
  tokenLikelihoods?: {
    token: string;
    likelihood: number;
  }[][];
  showGraph?: boolean;
  showPercent?: boolean;
}

export type ButtonVariant = "primary" | "social";
