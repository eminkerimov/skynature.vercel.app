import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import document from "./test/fixtures/project-data.json";
import App from "./App";
import { FavoritesProvider } from "./context/FavoritesContext";

const fetchMock = vi.fn(async () => new Response(JSON.stringify(document), {
  headers: { "Content-Type": "application/json" },
}));

beforeAll(() => {
  vi.stubGlobal("fetch", fetchMock);
  Object.defineProperty(window, "scrollTo", {
    configurable: true,
    value: () => undefined,
  });
});

afterAll(() => vi.unstubAllGlobals());

function renderRoute(route: string) {
  return render(
    <StrictMode>
      <MemoryRouter initialEntries={[route]}>
        <FavoritesProvider>
          <App />
          <LocationProbe />
        </FavoritesProvider>
      </MemoryRouter>
    </StrictMode>,
  );
}

function LocationProbe() {
  return <output data-testid="query">{useLocation().search}</output>;
}

function waitForPage(name: string) {
  // A cold lazy route can need more than RTL's default second while the full
  // suite compiles its modules in parallel on Windows.
  return screen.findByRole("heading", { name, level: 1 }, { timeout: 5000 });
}

describe("application routes", () => {
  it("loads the JSON once in StrictMode and reuses it across catalogue, stay, and saved pages", async () => {
    const user = userEvent.setup();
    renderRoute("/");
    await waitForPage("Find your place in nature");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("link", { name: "Explore" }));
    await waitForPage("Find somewhere remarkable");
    expect(screen.getByText("30 stays")).toBeInTheDocument();
    const firstCard = screen.getAllByRole("link", { name: /^View / })[0];
    const selectedName = firstCard.getAttribute("aria-label")!.replace(/^View /, "");
    await user.click(firstCard);
    await waitForPage(selectedName);
    await user.click(screen.getByRole("button", { name: "Save stay" }));
    await user.click(within(screen.getByRole("navigation", { name: "Primary navigation" })).getByRole("link", { name: /^Saved stays/ }));
    await waitForPage("Saved stays");
    expect(screen.getByRole("heading", { name: selectedName })).toBeInTheDocument();
    await user.click(within(screen.getByRole("navigation", { name: "Primary navigation" })).getByRole("link", { name: "About" }));
    await waitForPage("Nature stays, all in one place.");
    expect(within(screen.getByRole("navigation", { name: "Primary navigation" })).getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
    expect(within(screen.getByRole("contentinfo")).getByRole("link", { name: "About SkyNature" })).toHaveAttribute("href", "/about");
    await user.click(screen.getByRole("link", { name: "Explore the collection" }));
    await waitForPage("Find somewhere remarkable");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  }, 15_000);

  it.each([
    ["/", "Find your place in nature"],
    ["/explore", "Find somewhere remarkable"],
    ["/stays/mosswood-ridge-cabin", "Mosswood Ridge Cabin"],
    ["/saved", "Saved stays"],
    ["/compare", "Compare stays"],
    ["/about", "Nature stays, all in one place."],
    ["/missing-page", "This trail ends here."],
  ])("renders %s", async (route, heading) => {
    renderRoute(route);
    expect(await waitForPage(heading)).toBeInTheDocument();
  });

  it("preserves dates and guests while changing catalogue filters", async () => {
    const user = userEvent.setup();
    renderRoute("/explore?checkIn=2026-12-10&checkOut=2026-12-15&guests=4");
    await waitForPage("Find somewhere remarkable");
    await user.selectOptions(screen.getAllByLabelText("Stay type")[0], "Cabin");
    const cabinCount = document.data.stays.filter((stay) => stay.type === "Cabin" && stay.maxGuests >= 4).length;
    expect(screen.getByText(`${cabinCount} stays`)).toBeInTheDocument();
    const params = new URLSearchParams(screen.getByTestId("query").textContent ?? "");
    expect(params.get("type")).toBe("Cabin");
    expect(params.get("checkIn")).toBe("2026-12-10");
    expect(params.get("checkOut")).toBe("2026-12-15");
    expect(params.get("guests")).toBe("4");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("opens a newly added stay directly by slug", async () => {
    const stay = document.data.stays[29];
    renderRoute(`/stays/${stay.slug}`);
    expect(await waitForPage(stay.name)).toBeInTheDocument();
    const gallery = screen.getByRole("region", { name: `${stay.name} photo gallery` });
    expect(gallery.querySelectorAll("img")).toHaveLength(5);
  });

  it("carries dates and guest count from the catalogue into the booking form", async () => {
    const user = userEvent.setup();
    renderRoute("/explore?checkIn=2026-12-10&checkOut=2026-12-15&guests=4");
    await waitForPage("Find somewhere remarkable");
    const firstStayLink = screen.getAllByRole("link", { name: /^View / })[0];
    const name = firstStayLink.getAttribute("aria-label")!.replace(/^View /, "");
    expect(document.data.stays.find((stay) => stay.name === name)!.maxGuests).toBeGreaterThanOrEqual(4);
    await user.click(firstStayLink);
    await waitForPage(name);
    await user.click(screen.getByRole("button", { name: "Choose dates" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByLabelText("Check-in")).toHaveValue("2026-12-10");
    expect(within(dialog).getByLabelText("Check-out")).toHaveValue("2026-12-15");
    expect(within(dialog).getByLabelText("Guests")).toHaveValue("4");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("selects up to three stays from cards, compares them, and clears the selection", async () => {
    const user = userEvent.setup();
    renderRoute("/explore");
    await waitForPage("Find somewhere remarkable");
    for (let count = 0; count < 3; count++) {
      await user.click(screen.getAllByRole("button", { name: /^Compare / })[0]);
    }
    const selected = JSON.parse(localStorage.getItem("skynature:compare-stays") ?? "[]") as string[];
    expect(selected).toHaveLength(3);
    await user.click(screen.getAllByRole("button", { name: /^Compare / })[0]);
    const bar = screen.getByRole("complementary", { name: "Selected stays for comparison" });
    expect(within(bar).getByRole("status")).toHaveTextContent("You can compare up to 3 stays");
    await user.click(within(bar).getByRole("link", { name: "Compare" }));
    await waitForPage("Compare stays");
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("columnheader")).toHaveLength(4);
    for (const id of selected) {
      expect(within(table).getByRole("heading", { name: document.data.stays.find((stay) => stay.id === id)!.name })).toBeInTheDocument();
    }
    await user.click(screen.getByRole("button", { name: "Clear comparison" }));
    expect(screen.getByRole("heading", { name: "Find your perfect match" })).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("skynature:compare-stays") ?? "[]")).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  }, 15_000);
});
