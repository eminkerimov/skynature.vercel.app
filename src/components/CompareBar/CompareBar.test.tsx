import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { COMPARE_STORAGE_KEY } from "../../context/CompareContext";
import { FavoritesProvider } from "../../context/FavoritesContext";
import AppLayout from "../../layouts/AppLayout/AppLayout";
import layoutStyles from "../../layouts/AppLayout/AppLayout.module.scss";
import { projectData, ProjectDataTestProvider } from "../../test/projectData";
import CompareBar from "./CompareBar";

const stays = projectData.stays.slice(0, 3);
const search = "?checkIn=2027-01-10&checkOut=2027-01-14&guests=2";

function CurrentLocation() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
}

function renderBar() {
  localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify([stays[0].id]));
  render(
    <ProjectDataTestProvider>
      <MemoryRouter initialEntries={[`/explore${search}`]}>
        <CompareBar />
        <CurrentLocation />
      </MemoryRouter>
    </ProjectDataTestProvider>,
  );
}

describe("CompareBar", () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ["/about", "/explore"],
    ["/about/", `/stays/${stays[0].id}`],
  ])("hides on %s and restores selected stays on %s", async (aboutPath, returnPath) => {
    const user = userEvent.setup();
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify([stays[0].id]));
    const { container } = render(
      <ProjectDataTestProvider>
        <FavoritesProvider>
          <MemoryRouter initialEntries={["/explore"]}>
            <AppLayout />
            <Link to={aboutPath}>Visit About</Link>
            <Link to={returnPath}>Return to stays</Link>
          </MemoryRouter>
        </FavoritesProvider>
      </ProjectDataTestProvider>,
    );
    const layout = container.firstElementChild;
    const barName = "Selected stays for comparison";
    expect(within(screen.getByRole("complementary", { name: barName })).getByText(stays[0].name)).toBeInTheDocument();
    expect(layout).toHaveClass(layoutStyles.compareSpace);

    await user.click(screen.getByRole("link", { name: "Visit About" }));

    expect(screen.queryByRole("complementary", { name: barName })).not.toBeInTheDocument();
    expect(layout).not.toHaveClass(layoutStyles.compareSpace);
    expect(JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY) ?? "[]")).toEqual([stays[0].id]);

    await user.click(screen.getByRole("link", { name: "Return to stays" }));

    const restoredBar = screen.getByRole("complementary", { name: barName });
    expect(within(restoredBar).getByText(stays[0].name)).toBeInTheDocument();
    expect(within(restoredBar).getByText("1 of 3")).toBeInTheDocument();
    expect(layout).toHaveClass(layoutStyles.compareSpace);
    expect(JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY) ?? "[]")).toEqual([stays[0].id]);
  });

  it("adds the second and third stay from the bottom bar without navigating away", async () => {
    const user = userEvent.setup();
    renderBar();
    const bar = screen.getByRole("complementary", { name: "Selected stays for comparison" });

    for (const stay of stays.slice(1)) {
      await user.click(within(bar).getByRole("button", { name: "Add stay" }));
      const dialog = screen.getByRole("dialog", { name: "Add a stay to compare" });
      expect(within(dialog).queryByRole("button", { name: `Add ${stays[0].name} to comparison` })).not.toBeInTheDocument();
      await user.type(within(dialog).getByRole("searchbox", { name: "Find a stay" }), stay.name);
      await user.click(within(dialog).getByRole("button", { name: `Add ${stay.name} to comparison` }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(within(bar).getByText(stay.name)).toBeInTheDocument();
      expect(screen.getByTestId("location")).toHaveTextContent(`/explore${search}`);
    }

    expect(within(bar).getByText("3 of 3")).toBeInTheDocument();
    expect(within(bar).queryByRole("button", { name: "Add stay" })).not.toBeInTheDocument();
    expect(within(bar).getByRole("link", { name: "Compare" })).toHaveAttribute("href", `/compare${search}`);
    expect(JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY) ?? "[]")).toEqual(stays.map((stay) => stay.id));
  });

  it("returns focus to Add stay after cancelling and resets the search on reopening", async () => {
    const user = userEvent.setup();
    renderBar();
    const addButton = screen.getByRole("button", { name: "Add stay" });

    await user.click(addButton);
    await user.type(screen.getByRole("searchbox", { name: "Find a stay" }), "anything");
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(addButton).toHaveFocus();
    expect(JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY) ?? "[]")).toEqual([stays[0].id]);
    await user.click(addButton);
    expect(screen.getByRole("searchbox", { name: "Find a stay" })).toHaveValue("");
  });
});
