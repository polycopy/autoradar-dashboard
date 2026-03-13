"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import React from "react";

const MAX_COMPARE = 3;

type CompareContextType = {
  selectedIds: string[];
  toggleCompare: (id: string) => void;
  isSelected: (id: string) => boolean;
  clearCompare: () => void;
  selectedCount: number;
};

const CompareContext = createContext<CompareContextType>({
  selectedIds: [],
  toggleCompare: () => {},
  isSelected: () => false,
  clearCompare: () => {},
  selectedCount: 0,
});

export function useCompare() {
  return useContext(CompareContext);
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleCompare = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds],
  );

  const clearCompare = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return React.createElement(
    CompareContext.Provider,
    {
      value: {
        selectedIds,
        toggleCompare,
        isSelected,
        clearCompare,
        selectedCount: selectedIds.length,
      },
    },
    children,
  );
}
