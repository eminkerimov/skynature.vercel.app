import { act, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { describe, expect, it } from "vitest";
import { useFavorites } from "../hooks/useFavorites";
import { FavoritesProvider } from "./FavoritesContext";

const STORAGE_KEY = "skynature:saved-stays";

function wrapper({ children }: PropsWithChildren) {
  return <FavoritesProvider>{children}</FavoritesProvider>;
}

describe("FavoritesProvider", () => {
  it("adds and removes a stay while keeping localStorage in sync", () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => result.current.toggleFavorite("pine-ridge-cabin"));

    expect(result.current.ids).toEqual(["pine-ridge-cabin"]);
    expect(result.current.isFavorite("pine-ridge-cabin")).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual([
      "pine-ridge-cabin",
    ]);

    act(() => result.current.toggleFavorite("pine-ridge-cabin"));

    expect(result.current.ids).toEqual([]);
    expect(result.current.isFavorite("pine-ridge-cabin")).toBe(false);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual([]);
  });

  it("restores saved stay IDs from localStorage", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(["cedar-hollow", "lake-mist-lodge"]),
    );

    const { result } = renderHook(() => useFavorites(), { wrapper });

    expect(result.current.ids).toEqual([
      "cedar-hollow",
      "lake-mist-lodge",
    ]);
    expect(result.current.isFavorite("lake-mist-lodge")).toBe(true);
  });

  it("ignores damaged localStorage data", () => {
    localStorage.setItem(STORAGE_KEY, "{not-valid-json");

    const { result } = renderHook(() => useFavorites(), { wrapper });

    expect(result.current.ids).toEqual([]);
  });
});
