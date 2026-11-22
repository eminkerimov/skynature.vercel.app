import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CompareProvider, COMPARE_STORAGE_KEY } from "./CompareContext";
import { ProjectDataContext } from "./ProjectDataContext";
import { useCompare } from "../hooks/useCompare";
import { projectData } from "../test/projectData";

const firstIds = projectData.stays.slice(0, 4).map((stay) => stay.id);

function Controls() {
  const { ids, toggleCompare, clearCompare, statusMessage } = useCompare();
  return (
    <>
      <div role="group" aria-label="Compared IDs">{ids.join(",")}</div>
      <p role="status">{statusMessage}</p>
      {firstIds.map((id) => <button type="button" key={id} onClick={() => toggleCompare(id)}>Toggle {id}</button>)}
      <button type="button" onClick={() => toggleCompare("missing-stay")}>Toggle missing stay</button>
      <button type="button" onClick={clearCompare}>Clear comparison</button>
    </>
  );
}

function Harness({ data = projectData }) {
  return (
    <ProjectDataContext.Provider value={data}>
      <CompareProvider><Controls /></CompareProvider>
    </ProjectDataContext.Provider>
  );
}

describe("CompareProvider", () => {
  it("restores only unique catalog IDs and persists at most three", () => {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify([
      firstIds[0], firstIds[0], "removed-stay", 7, null, ...firstIds.slice(1),
    ]));

    render(<Harness />);

    expect(screen.getByLabelText("Compared IDs")).toHaveTextContent(firstIds.slice(0, 3).join(","));
    expect(JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY) ?? "[]")).toEqual(firstIds.slice(0, 3));
  });

  it("enforces the limit, explains it, and releases space when a stay is removed", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    for (const id of firstIds.slice(0, 3)) await user.click(screen.getByRole("button", { name: `Toggle ${id}` }));
    await user.click(screen.getByRole("button", { name: `Toggle ${firstIds[3]}` }));

    expect(screen.getByLabelText("Compared IDs")).toHaveTextContent(firstIds.slice(0, 3).join(","));
    expect(screen.getByRole("status")).toHaveTextContent("You can compare up to 3 stays");

    await user.click(screen.getByRole("button", { name: `Toggle ${firstIds[1]}` }));
    await user.click(screen.getByRole("button", { name: `Toggle ${firstIds[3]}` }));

    expect(screen.getByLabelText("Compared IDs")).toHaveTextContent([firstIds[0], firstIds[2], firstIds[3]].join(","));
    expect(screen.getByRole("status")).toBeEmptyDOMElement();

    await user.click(screen.getByRole("button", { name: "Clear comparison" }));
    expect(screen.getByLabelText("Compared IDs")).toBeEmptyDOMElement();
    expect(JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY) ?? "[]")).toEqual([]);
  });

  it("recovers from malformed storage and ignores an ID outside the catalog", async () => {
    localStorage.setItem(COMPARE_STORAGE_KEY, "{broken-json");
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole("button", { name: "Toggle missing stay" }));
    expect(screen.getByLabelText("Compared IDs")).toBeEmptyDOMElement();

    await user.click(screen.getByRole("button", { name: `Toggle ${firstIds[0]}` }));
    expect(screen.getByLabelText("Compared IDs")).toHaveTextContent(firstIds[0]);
  });

  it("removes selections when their stay disappears from the catalog", () => {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(firstIds.slice(0, 2)));
    const { rerender } = render(<Harness />);

    rerender(<Harness data={{ ...projectData, stays: projectData.stays.slice(1) }} />);

    expect(screen.getByLabelText("Compared IDs")).toHaveTextContent(firstIds[1]);
    expect(JSON.parse(localStorage.getItem(COMPARE_STORAGE_KEY) ?? "[]")).toEqual([firstIds[1]]);
  });
});
