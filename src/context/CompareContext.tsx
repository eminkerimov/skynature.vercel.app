import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from "react";
import { useProjectData } from "./ProjectDataContext";

export const COMPARE_STORAGE_KEY = "skynature:compare-stays";
export const MAX_COMPARED_STAYS = 3;

export interface CompareContextValue {
  ids: string[];
  isCompared: (id: string) => boolean;
  toggleCompare: (id: string) => void;
  removeCompare: (id: string) => void;
  clearCompare: () => void;
  statusMessage: string;
  dismissStatus: () => void;
}

export const CompareContext = createContext<CompareContextValue | undefined>(undefined);

interface CompareState {
  ids: string[];
  statusMessage: string;
}

type CompareAction =
  | { type: "toggle"; id: string; validIds: ReadonlySet<string> }
  | { type: "remove"; id: string }
  | { type: "validate"; validIds: ReadonlySet<string> }
  | { type: "clear" }
  | { type: "dismiss" };

function normalizeIds(value: unknown, validIds: ReadonlySet<string>): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.filter(
    (id): id is string => typeof id === "string" && validIds.has(id),
  ))).slice(0, MAX_COMPARED_STAYS);
}

function readStoredSelection(validIds: ReadonlySet<string>): CompareState {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(COMPARE_STORAGE_KEY) ?? "[]");
    return { ids: normalizeIds(value, validIds), statusMessage: "" };
  } catch {
    return { ids: [], statusMessage: "" };
  }
}

function reducer(state: CompareState, action: CompareAction): CompareState {
  switch (action.type) {
    case "toggle": {
      if (!action.validIds.has(action.id)) return state;
      const ids = normalizeIds(state.ids, action.validIds);
      if (ids.includes(action.id)) {
        return { ids: ids.filter((id) => id !== action.id), statusMessage: "" };
      }
      if (ids.length >= MAX_COMPARED_STAYS) {
        return {
          ids,
          statusMessage: "You can compare up to 3 stays. Remove one before adding another.",
        };
      }
      return { ids: [...ids, action.id], statusMessage: "" };
    }
    case "remove":
      return { ids: state.ids.filter((id) => id !== action.id), statusMessage: "" };
    case "validate": {
      const ids = normalizeIds(state.ids, action.validIds);
      if (ids.length === state.ids.length && ids.every((id, index) => id === state.ids[index])) return state;
      return { ids, statusMessage: "" };
    }
    case "clear":
      return { ids: [], statusMessage: "" };
    case "dismiss":
      return { ...state, statusMessage: "" };
  }
}

export function CompareProvider({ children }: PropsWithChildren) {
  const { stays } = useProjectData();
  const validIds = useMemo(() => new Set(stays.map((stay) => stay.id)), [stays]);
  const [state, dispatch] = useReducer(reducer, validIds, readStoredSelection);
  const ids = useMemo(() => normalizeIds(state.ids, validIds), [state.ids, validIds]);

  useEffect(() => {
    dispatch({ type: "validate", validIds });
  }, [validIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // The selection remains usable when browser storage is unavailable.
    }
  }, [ids]);

  const isCompared = useCallback((id: string) => ids.includes(id), [ids]);
  const toggleCompare = useCallback((id: string) => {
    dispatch({ type: "toggle", id, validIds });
  }, [validIds]);
  const removeCompare = useCallback((id: string) => dispatch({ type: "remove", id }), []);
  const clearCompare = useCallback(() => dispatch({ type: "clear" }), []);
  const dismissStatus = useCallback(() => dispatch({ type: "dismiss" }), []);
  const value = useMemo<CompareContextValue>(() => ({
    ids,
    isCompared,
    toggleCompare,
    removeCompare,
    clearCompare,
    statusMessage: state.statusMessage,
    dismissStatus,
  }), [ids, isCompared, toggleCompare, removeCompare, clearCompare, state.statusMessage, dismissStatus]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}
