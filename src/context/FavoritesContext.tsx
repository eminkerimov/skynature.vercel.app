import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

const STORAGE_KEY = "skynature:saved-stays";

export interface FavoritesContextValue {
  ids: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  setFavorite: (id: string, saved: boolean) => void;
}

export const FavoritesContext = createContext<
  FavoritesContextValue | undefined
>(undefined);

function readStoredIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return Array.from(
      new Set(parsedValue.filter((value): value is string => typeof value === "string")),
    );
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: PropsWithChildren) {
  const [ids, setIds] = useState<string[]>(readStoredIds);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // Favorites remain available for the current session when storage is blocked.
    }
  }, [ids]);

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  const toggleFavorite = useCallback((id: string) => {
    if (!id.trim()) {
      return;
    }

    setIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((currentId) => currentId !== id)
        : [...currentIds, id],
    );
  }, []);

  const setFavorite = useCallback((id: string, saved: boolean) => {
    if (!id.trim()) return;
    setIds((currentIds) => {
      if (currentIds.includes(id) === saved) return currentIds;
      return saved ? [...currentIds, id] : currentIds.filter((currentId) => currentId !== id);
    });
  }, []);

  const value = useMemo(
    () => ({ ids, isFavorite, toggleFavorite, setFavorite }),
    [ids, isFavorite, toggleFavorite, setFavorite],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
