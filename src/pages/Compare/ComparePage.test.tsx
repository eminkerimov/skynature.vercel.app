import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CompareProvider, COMPARE_STORAGE_KEY } from "../../context/CompareContext";
import { ProjectDataContext } from "../../context/ProjectDataContext";
import { projectData } from "../../test/projectData";
import { formatCurrency } from "../../utils/formatters";
import ComparePage from "./ComparePage";

const selected = projectData.stays.slice(0, 3);
const bookingSearch = "?checkIn=2027-01-10&checkOut=2027-01-14&guests=2";

function CurrentLocation() {
  const { pathname, search } = useLocation();
  return <p>{pathname}{search}</p>;
}

function renderComparison(ids: string[] = []) {
  localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids));
  return render(
    <ProjectDataContext.Provider value={projectData}>
      <CompareProvider>
        <MemoryRouter initialEntries={[`/compare${bookingSearch}&sort=price-asc`]}>
          <Routes>
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/explore" element={<CurrentLocation />} />
          </Routes>
        </MemoryRouter>
      </CompareProvider>
    </ProjectDataContext.Provider>,
  );
}

describe("ComparePage", () => {
  it("shows a useful empty state and preserves booking details when exploring", () => {
    renderComparison();

    expect(screen.getByRole("heading", { name: "Find your perfect match" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore stays" })).toHaveAttribute("href", `/explore${bookingSearch}`);
  });

  it("compares real prices, capacity, amenities, and policies for three stays", () => {
    renderComparison(selected.map((stay) => stay.id));
    const table = screen.getByRole("table");
    const prices = within(screen.getByRole("rowheader", { name: "Price / night" }).closest("tr")!).getAllByRole("cell");
    const capacities = within(screen.getByRole("rowheader", { name: "Guests" }).closest("tr")!).getAllByRole("cell");
    const amenities = within(screen.getByRole("rowheader", { name: "Amenities" }).closest("tr")!).getAllByRole("cell");
    const policies = within(screen.getByRole("rowheader", { name: "Cancellation" }).closest("tr")!).getAllByRole("cell");

    selected.forEach((stay, index) => {
      expect(within(table).getByRole("heading", { name: stay.name })).toBeInTheDocument();
      expect(prices[index]).toHaveTextContent(formatCurrency(stay.price));
      expect(capacities[index]).toHaveTextContent(`Up to ${stay.maxGuests}`);
      stay.amenities.forEach((amenity) => expect(amenities[index]).toHaveTextContent(amenity));
      expect(policies[index]).toHaveTextContent(stay.stayInfo.cancellationPolicy);
      expect(screen.getAllByRole("link", { name: "View stay" })[index]).toHaveAttribute("href", `/stays/${stay.slug}${bookingSearch}`);
    });
  });

  it("adds a second and third stay directly on the comparison page", async () => {
    const user = userEvent.setup();
    renderComparison([selected[0].id]);

    for (const stay of selected.slice(1)) {
      await user.click(screen.getByRole("button", { name: "Add another stay" }));
      const dialog = screen.getByRole("dialog", { name: "Add a stay to compare" });
      expect(within(dialog).queryByRole("button", { name: `Add ${selected[0].name} to comparison` })).not.toBeInTheDocument();
      expect(within(dialog).getByRole("searchbox", { name: "Find a stay" })).toHaveValue("");

      await user.type(within(dialog).getByRole("searchbox", { name: "Find a stay" }), stay.name);
      await user.click(within(dialog).getByRole("button", { name: `Add ${stay.name} to comparison` }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(within(screen.getByRole("table")).getByRole("heading", { name: stay.name })).toBeInTheDocument();
    }

    expect(screen.queryByRole("button", { name: "Add another stay" })).not.toBeInTheDocument();
    expect(within(screen.getByRole("table")).getAllByRole("columnheader")).toHaveLength(4);
    expect(JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY) ?? "[]")).toEqual(selected.map((stay) => stay.id));
    expect(screen.getAllByRole("link", { name: "View stay" })[1]).toHaveAttribute("href", `/stays/${selected[1].slug}${bookingSearch}`);
  });

  it("lets an empty comparison start with a stay chosen on the same page", async () => {
    const user = userEvent.setup();
    renderComparison();

    await user.click(screen.getByRole("button", { name: "Choose stays" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: `Add ${selected[0].name} to comparison` }));

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: selected[0].name })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add another stay" })).toBeInTheDocument();
  });

  it("shows search feedback and keeps the selection when the picker is cancelled", async () => {
    const user = userEvent.setup();
    renderComparison([selected[0].id]);

    await user.click(screen.getByRole("button", { name: "Add another stay" }));
    const dialog = screen.getByRole("dialog");
    const search = within(dialog).getByRole("searchbox", { name: "Find a stay" });
    await user.type(search, "no-such-place");
    expect(within(dialog).getByRole("status")).toHaveTextContent("No stays match your search");
    await user.clear(search);
    await user.type(search, selected[1].location);
    expect(within(dialog).getByRole("button", { name: `Add ${selected[1].name} to comparison` })).toBeInTheDocument();
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add another stay" })).toHaveFocus();
    expect(JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY) ?? "[]")).toEqual([selected[0].id]);
  });

  it("removes an individual stay and clears the remaining comparison", async () => {
    const user = userEvent.setup();
    renderComparison(selected.map((stay) => stay.id));

    await user.click(screen.getByRole("button", { name: `Remove ${selected[0].name} from comparison` }));
    expect(screen.queryByRole("heading", { name: selected[0].name })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: selected[1].name })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear comparison" }));
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Find your perfect match" })).toBeInTheDocument();
  });

  it("frees a slot before returning to Explore to change a stay", async () => {
    const user = userEvent.setup();
    renderComparison([selected[0].id]);

    await user.click(screen.getByRole("button", { name: `Change ${selected[0].name}` }));

    expect(screen.getByText(`/explore${bookingSearch}`)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY) ?? "[]")).toEqual([]);
  });
});
