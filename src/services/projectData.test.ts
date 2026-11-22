import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import document from "../test/fixtures/project-data.json";

let service: typeof import("./projectData");

const response = (status = 200) => new Response(JSON.stringify(document), {
  status,
  headers: { "Content-Type": "application/json" },
});

beforeEach(async () => {
  vi.resetModules();
  service = await import("./projectData");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("project data source", () => {
  it("shares one request between simultaneous consumers and later page visits", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response());
    vi.stubGlobal("fetch", fetchMock);

    const first = service.loadProjectData();
    const second = service.loadProjectData();
    expect(second).toBe(first);
    const data = await first;
    expect(await service.loadProjectData()).toBe(data);
    expect(service.getCachedProjectData()).toBe(data);
    expect(data.stays).toHaveLength(30);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(service.PROJECT_DATA_URL, expect.objectContaining({ cache: "no-cache" }));
  });

  it("can retry an HTTP failure instead of caching the error", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(response(503)).mockResolvedValueOnce(response());
    vi.stubGlobal("fetch", fetchMock);
    await expect(service.loadProjectData()).rejects.toThrow("503");
    expect(service.getCachedProjectData()).toBeUndefined();
    expect((await service.loadProjectData()).stays).toHaveLength(30);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("rejects an incompatible document and allows a corrected response", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ schemaVersion: 2, project: "skynature", data: {} })))
      .mockResolvedValueOnce(response());
    vi.stubGlobal("fetch", fetchMock);
    await expect(service.loadProjectData()).rejects.toThrow("invalid format");
    expect((await service.loadProjectData()).stays).toHaveLength(30);
  });

  it("rejects broken related-stay references before rendering pages", () => {
    const invalid = structuredClone(document);
    invalid.data.stays[0].relatedIds = ["missing-stay"];
    expect(() => service.parseProjectData(invalid)).toThrow("invalid format");
  });

  it("derives filter choices and counts when only the catalogue was updated", () => {
    const edited = structuredClone(document);
    edited.data.stays[0].region = "New woodland region";
    edited.data.stays[0].amenities.push("New amenity");
    edited.data.numbers.stays = 999;
    const data = service.parseProjectData(edited);
    expect(data.destinations).toContain("New woodland region");
    expect(data.allAmenities).toContain("New amenity");
    expect(data.numbers.stays).toBe(30);
    expect(data.numbers.images).toBe(154);
  });

  it("aborts a stalled request and permits another attempt", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockImplementationOnce((_url: string, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener("abort", () => reject(new DOMException("Request timed out", "AbortError")));
    })).mockResolvedValueOnce(response());
    vi.stubGlobal("fetch", fetchMock);
    const rejection = expect(service.loadProjectData()).rejects.toThrow("timed out");
    await vi.advanceTimersByTimeAsync(15_000);
    await rejection;
    expect((await service.loadProjectData()).stays).toHaveLength(30);
  });
});
