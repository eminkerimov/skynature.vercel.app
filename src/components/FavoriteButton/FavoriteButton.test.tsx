import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FavoritesProvider } from "../../context/FavoritesContext";
import { ToastProvider } from "../../context/ToastContext";
import FavoriteButton from "./FavoriteButton";

describe("favorite feedback", () => {
  it("announces saving and restores the previous state when Undo is selected", async () => {
    const user = userEvent.setup();
    render(<FavoritesProvider><ToastProvider><FavoriteButton stay={{ id: "stay-01", name: "Mosswood Ridge Cabin" }} /></ToastProvider></FavoritesProvider>);
    await user.click(screen.getByRole("button", { name: "Save Mosswood Ridge Cabin" }));
    expect(screen.getByRole("status")).toHaveTextContent("Mosswood Ridge Cabin saved");
    expect(screen.getByRole("button", { name: "Remove Mosswood Ridge Cabin from saved stays" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("button", { name: "Save Mosswood Ridge Cabin" })).toHaveAttribute("aria-pressed", "false");
    expect(JSON.parse(localStorage.getItem("skynature:saved-stays") ?? "[]")).toEqual([]);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
