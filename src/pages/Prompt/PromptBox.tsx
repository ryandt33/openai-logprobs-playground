import { useContext } from "react";
import Card from "../../components/core/Card";
import TextArea from "../../components/core/TextArea";
import { Message, Variant } from "../../resources/types";
import { StoreContext } from "../../context/storeContext";
import Button from "../../components/core/Button";
import PieChart from "./PieChart";
import { generate } from "../../utils/openai/generate";
import LogprobBox from "./PercentLogProbs";

export default function PromptBox({
  message,
  index,
}: {
  message: Message;
  index: number;
}) {
  const storeContext = useContext(StoreContext);

  const { store } = storeContext || {};
  const { messages } = store || {};

  const regenerate = async (index: number) => {
    if (!store?.messages) return;

    const logprobs = store?.messages[index].tokenLikelihoods ? true : false;
    const newMessages = store?.messages.filter((_m, i) => i < index);

    try {
      const response = await generate(
        { ...store, messages: newMessages },
        logprobs
      );

      console.log(response);

      if (!response || typeof response !== "object") {
        throw new Error("Error generating message");
      }

      storeContext?.updateStore({
        messages: [...newMessages, response],
      });
    } catch (error) {
      storeContext?.updateStore({
        error: typeof error === "string" ? error : "Error generating message",
      });
    }
  };

  const showGraph = (index: number) => {
    storeContext?.updateStore({
      messages: messages?.map((m, i) =>
        i === index ? { ...m, showGraph: !m.showGraph } : m
      ),
    });
  };

  const showPercent = (index: number) => {
    storeContext?.updateStore({
      messages: messages?.map((m, i) =>
        i === index ? { ...m, showPercent: !m.showPercent } : m
      ),
    });
  };

  return (
    <div key={index} className="my-5">
      <Card
        variant={message.role === "user" ? Variant.SECONDARY : Variant.PRIMARY}
      >
        <div
          className="text-right mr-5 mt-3 cursor-pointer"
          onClick={() => {
            storeContext?.updateStore({
              messages: messages?.filter((_m, i) => i !== index),
            });
          }}
        >
          X
        </div>
        <div>
          <div className="p-4 flex w-full">
            {!message.showPercent ||
            message.role === "user" ||
            !message.tokenLogprobs ? (
              <TextArea
                className="flex-grow"
                title={message.role.toUpperCase() + ":"}
                content={message.content}
                onChange={(e) => {
                  storeContext?.updateStore({
                    messages: messages?.map((m, i) =>
                      i === index
                        ? { ...m, content: e.target.value, tokenLogProbs: [] }
                        : m
                    ),
                  });
                }}
              />
            ) : (
              <LogprobBox logprobs={message.tokenLogprobs} />
            )}
            {message.role === "assistant" && message.content && (
              <div className="pl-3 w-20 mt-10">
                <Button
                  onClick={() => {
                    regenerate(index);
                  }}
                  children="⟳"
                  variant="primary"
                />
                <div className="h-1" />
                {message.tokenLikelihoods ? (
                  <Button
                    onClick={() => {
                      showGraph(index);
                    }}
                    children="◔"
                    variant="primary"
                  />
                ) : (
                  <Button
                    onClick={() => {
                      showPercent(index);
                    }}
                    children="%"
                    variant="primary"
                  />
                )}
              </div>
            )}
          </div>
          {message.showGraph && message.tokenLikelihoods && (
            <div>
              <PieChart data={message.tokenLikelihoods} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
