import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import fixture from "../test/fixtures/project-data.json";
import { getCachedProjectData, loadProjectData } from "../services/projectData";
import type { SkyNatureData } from "../types/projectData";
import { ProjectDataProvider, useProjectData } from "./ProjectDataContext";

vi.mock("../services/projectData", () => ({
  getCachedProjectData: vi.fn(),
  loadProjectData: vi.fn(),
}));

const data = fixture.data as unknown as SkyNatureData;

function Consumer() {
  const project = useProjectData();
  return <h1>{project.stays.length} loaded stays</h1>;
}

beforeEach(() => {
  vi.mocked(getCachedProjectData).mockReturnValue(undefined);
  vi.mocked(loadProjectData).mockReset();
});

describe("ProjectDataProvider", () => {
  it("waits for the shared data before mounting pages", async () => {
    let complete: (data: SkyNatureData) => void = () => undefined;
    vi.mocked(loadProjectData).mockReturnValue(new Promise((resolve) => { complete = resolve; }));
    render(<ProjectDataProvider><Consumer /></ProjectDataProvider>);
    expect(screen.getByRole("status")).toHaveTextContent("Finding a quiet place");
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    complete(data);
    expect(await screen.findByRole("heading", { name: "30 loaded stays" })).toBeInTheDocument();
  });

  it("shows a retry action after failure without substituting local stays", async () => {
    const user = userEvent.setup();
    vi.mocked(loadProjectData).mockRejectedValueOnce(new Error("Offline")).mockResolvedValueOnce(data);
    render(<ProjectDataProvider><Consumer /></ProjectDataProvider>);
    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn’t load the stays");
    expect(screen.queryByText("30 loaded stays")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("heading", { name: "30 loaded stays" })).toBeInTheDocument();
  });
});
