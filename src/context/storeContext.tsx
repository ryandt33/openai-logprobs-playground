import React, { createContext, useState, useCallback, ReactNode } from "react";
import { Message, Role } from "../resources/types";

export interface Store {
  apiKey?: string;
  error?: string;
  messages?: Message[];
  models?: {
    id: string;
  }[];
  selectedModel?: string;
}

export interface StoreContextType {
  store: Store;
  setStore: (Store: Store) => void;
  updateStore: (newProps: Partial<Store>) => void;
}

const defaultStore: Store = {
  apiKey: "",
  error: "",
  messages: [
    {
      role: Role.USER,
      content: "",
    },
  ],
  models: [],
  selectedModel: "gpt-4o-mini",
};

export const StoreContext = createContext<StoreContextType | undefined>(
  undefined
);

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [store, setStoreState] = useState<Store>(defaultStore);

  const setStore = useCallback((newStore: Store) => {
    setStoreState(newStore);
  }, []);

  const updateStore = (newProps: Partial<Store>) => {
    setStore({ ...store, ...newProps });
  };

  return (
    <StoreContext.Provider value={{ store, setStore, updateStore }}>
      {children}
    </StoreContext.Provider>
  );
};
