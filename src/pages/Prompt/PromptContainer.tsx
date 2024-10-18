import { useContext } from "react";
import { StoreContext } from "../../context/storeContext";
import { Message } from "../../resources/types";
import PromptBox from "./PromptBox";
import GenerationOptions from "./GenerationOptions";

export default function PromptContainer() {
  const storeContext = useContext(StoreContext);
  const { store } = storeContext || {};

  return (
    <div>
      {store?.messages?.map((message: Message, index) => (
        <PromptBox key={index} message={message} index={index} />
      ))}
      <GenerationOptions />
    </div>
  );
}
