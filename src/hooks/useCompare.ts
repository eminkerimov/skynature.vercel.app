import { useContext } from "react";
import { CompareContext } from "../context/CompareContext";

export function useCompare() {
  const comparison = useContext(CompareContext);
  if (!comparison) throw new Error("useCompare must be used inside CompareProvider.");
  return comparison;
}
