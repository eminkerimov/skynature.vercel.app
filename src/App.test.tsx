import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it } from "vitest";
import App from "./App";
import { FavoritesProvider } from "./context/FavoritesContext";

beforeAll(() => {
  Object.defineProperty(window, "scrollTo", {
    configurable: true,
    value: () => undefined,
  });
});

function renderRoute(route: string) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <FavoritesProvider>
        <App />
      </FavoritesProvider>
    </MemoryRouter>,
  );
}

describe("application routes", () => {
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
});
