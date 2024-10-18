import { useState } from "react";
import { Logprob } from "../../resources/types";
import { calculateTokenLikelihoods } from "../../utils/openai/generate";
import PieChart from "./PieChart";

export default function LogprobBox({ logprobs }: { logprobs: Logprob[] }) {
  const [activeProb, setActiveProb] = useState<number | null>(null);

  return (
    <div className="w-full">
      {logprobs.map((logprob, index) => {
        if (!logprob.top_logprobs) return null;
        return (
          <span
            key={index}
            className={`${
              logprob.logprob > -0.01
                ? "text-blue-500"
                : logprob.logprob > -0.2
                ? "text-green-500"
                : logprob.logprob > -0.5
                ? "text-yellow-500"
                : logprob.logprob > -0.8
                ? "text-red-500"
                : "text-purple-500"
            } hover:underline cursor-pointer relative`}
            onClick={() => {
              setActiveProb(index);
            }}
          >
            {logprob.token}
            {logprob.token
              .split("\n")
              .filter((_t, i) => i > 0)
              .map((_t, i) => (
                <br key={i} />
              ))}
          </span>
        );
      })}
      {activeProb !== null &&
        logprobs[activeProb] &&
        logprobs
          .filter((_l, i) => i === activeProb)
          .map((l, i) => {
            console.log("hi", l);
            if (!l.top_logprobs) return null;
            const likelihood = calculateTokenLikelihoods(l.top_logprobs);

            console.log(likelihood);
            return (
              <div
                key={i}
                className="w-full mt-5 border-2 border-slate-500 rounded-md p-5 text-center"
              >
                <div className="">
                  <PieChart data={[likelihood]} />
                </div>
              </div>
            );
          })}
    </div>
  );
}
