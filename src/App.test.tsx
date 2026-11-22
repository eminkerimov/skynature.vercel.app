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

describe("application routes", () => {
  it("loads the JSON once in StrictMode and reuses it across catalogue, stay, and saved pages", async () => {
    const user = userEvent.setup();
    renderRoute("/");
    await screen.findByRole("heading", { name: "Find your place in nature", level: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("link", { name: "Explore" }));
    await screen.findByRole("heading", { name: "Find somewhere remarkable", level: 1 });
    expect(screen.getByText("30 stays")).toBeInTheDocument();
    const firstCard = screen.getAllByRole("link", { name: /^View / })[0];
    const selectedName = firstCard.getAttribute("aria-label")!.replace(/^View /, "");
    await user.click(firstCard);
    await screen.findByRole("heading", { name: selectedName, level: 1 });
    await user.click(screen.getByRole("button", { name: "Save stay" }));
    await user.click(within(screen.getByRole("navigation", { name: "Primary navigation" })).getByRole("link", { name: /^Saved stays/ }));
    await screen.findByRole("heading", { name: "Saved stays", level: 1 });
    expect(screen.getByRole("heading", { name: selectedName })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["/", "Find your place in nature"],
    ["/explore", "Find somewhere remarkable"],
    ["/stays/mosswood-ridge-cabin", "Mosswood Ridge Cabin"],
    ["/saved", "Saved stays"],
    ["/missing-page", "This trail ends here."],
  ])("renders %s", async (route, heading) => {
    renderRoute(route);
    expect(await screen.findByRole("heading", { name: heading, level: 1 })).toBeInTheDocument();
  });

  it("preserves dates and guests while changing catalogue filters", async () => {
    const user = userEvent.setup();
    renderRoute("/explore?checkIn=2026-12-10&checkOut=2026-12-15&guests=4");
    await screen.findByRole("heading", { name: "Find somewhere remarkable", level: 1 });
    await user.selectOptions(screen.getAllByLabelText("Stay type")[0], "Cabin");
    expect(screen.getByText("5 stays")).toBeInTheDocument();
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
    expect(await screen.findByRole("heading", { name: stay.name, level: 1 })).toBeInTheDocument();
    const gallery = screen.getByRole("region", { name: `${stay.name} photo gallery` });
    expect(gallery.querySelectorAll("img")).toHaveLength(5);
  });
});
