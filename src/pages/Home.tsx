import { useContext, useEffect } from "react";
import { StoreContext } from "../context/storeContext";
import { useNavigate } from "react-router-dom";
import Dropdown from "../components/core/Dropdown";
import PromptContainer from "./Prompt/PromptContainer";
import { Variant } from "../resources/types";
import Card from "../components/core/Card";

export default function Home() {
  const storeContext = useContext(StoreContext);
  const navigate = useNavigate();

  const { store } = storeContext || {};

  useEffect(() => {
    if (!store?.apiKey) {
      navigate("/");
    }
    if (window.location.pathname === "/" && store?.apiKey) {
      navigate("/home");
    }
  }, [store, navigate]);

  return (
    <div className="bg-blue-50 min-h-screen p-5">
      <div className="bg-slate-50 w-full h-full rounded-md shadow-md border-2 border-fe-blue-500 p-5">
        <div className="text-right">
          {store?.models && (
            <Dropdown
              title={store.selectedModel ? store.selectedModel : "Models"}
              options={store?.models?.map((o) => ({
                ...o,
                name: o.id,
                onClick: () => {
                  console.log(o.id);
                  storeContext?.updateStore({ selectedModel: o.id });
                },
              }))}
            />
          )}
        </div>
        {store?.error && (
          <div className="absolute top-5 right-5 border-fe-orange-500 border-2 rounded-md">
            <Card variant={Variant.SECONDARY}>
              <div
                className="text-right pr-2 cursor-pointer text-red-500"
                onClick={() => storeContext?.updateStore({ error: "" })}
              >
                x
              </div>
              <div className="text-center p-4">
                <div className="mt-4" />
                <p className="text-red-500">{store.error}</p>
                <div className="mt-4" />
              </div>
            </Card>
          </div>
        )}
        <div className="mt-5" />
        <PromptContainer />
      </div>
    </div>
  );
}
