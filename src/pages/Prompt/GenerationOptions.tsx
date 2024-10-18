import { useContext } from "react";
import { StoreContext } from "../../context/storeContext";
import Button from "../../components/core/Button";
import { Role } from "../../resources/types";
import { generate } from "../../utils/openai/generate";

export default function GenerationOptions() {
  const storeContext = useContext(StoreContext);
  const { store } = storeContext || {};
  const { messages } = store || {};

  const lastRole = !store?.messages?.length
    ? null
    : store.messages[store.messages.length - 1].role;

  const generateMessage = async (logprobs: boolean) => {
    try {
      if (!store || !messages) {
        throw new Error("Missing fields");
      }
      const response = await generate(store, logprobs);

      console.log(response);

      if (!response || typeof response !== "object") {
        throw new Error("Error generating message");
      }

      storeContext?.updateStore({
        messages: [...messages, response],
      });
    } catch (error) {
      storeContext?.updateStore({
        error: typeof error === "string" ? error : "Error generating message",
      });
    }
  };

  return (
    <div>
      {messages && Array.isArray(messages) && (
        <div className="flex justify-center items-center gap-10">
          <Button
            onClick={() => {
              storeContext?.updateStore({
                messages: [
                  ...messages,
                  {
                    role: lastRole === Role.USER ? Role.ASSISTANT : Role.USER,
                    content: "",
                  },
                ],
              });
            }}
            children="Manually Add Response"
            variant="primary"
          />
          {lastRole === Role.USER && (
            <Button
              onClick={() => {
                generateMessage(false);
              }}
              children="Generate Response"
              variant="primary"
            />
          )}
          {lastRole === Role.USER && (
            <Button
              onClick={() => {
                generateMessage(true);
              }}
              children="Generate With Logprobs"
              variant="primary"
            />
          )}{" "}
        </div>
      )}
    </div>
  );
}
