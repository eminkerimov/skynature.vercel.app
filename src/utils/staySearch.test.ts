import { describe, expect, it } from "vitest";
import { createStayHref, localDateKey, readBookingSearch } from "./staySearch";

describe("booking search handoff", () => {
  it("reads an ISO date range and a positive integer guest count", () => {
    expect(readBookingSearch("?checkIn=2028-02-28&checkOut=2028-02-29&guests=4")).toEqual({
      checkIn: "2028-02-28", checkOut: "2028-02-29", guests: 4,
    });
    expect(readBookingSearch("")).toEqual({ checkIn: "", checkOut: "", guests: null });
  });

  it.each(["2027-02-29", "2028-02-30", "2028-13-01", "2028-1-02", "0000-01-01", "not-a-date"])(
    "rejects invalid calendar date %s without normalizing it", (date) => {
      expect(readBookingSearch(`?checkIn=${date}&checkOut=2028-03-04`)).toEqual({
        checkIn: "", checkOut: "", guests: null,
      });
    },
  );

  it.each(["2028-06-08", "2028-06-10", "2028-02-30"])(
    "drops an invalid or non-forward check-out %s", (checkOut) => {
      expect(readBookingSearch(`?checkIn=2028-06-10&checkOut=${checkOut}`).checkOut).toBe("");
    },
  );

  it("does not carry a check-out without a check-in", () => {
    expect(readBookingSearch("?checkOut=2028-06-15").checkOut).toBe("");
  });

  it.each(["0", "-1", "2.5", "Infinity", "NaN", "1e2", "9007199254740992"])(
    "ignores invalid guest count %s", (guests) => {
      expect(readBookingSearch(`?guests=${guests}`).guests).toBeNull();
    },
  );

  it("passes only booking context into a stay URL", () => {
    const href = createStayHref("quietwater-a-frame", "?q=lake&type=Cabin&page=3&checkIn=2028-06-10&checkOut=2028-06-15&guests=4&rating=4.5");
    const url = new URL(href, "https://example.test");
    expect(url.pathname).toBe("/stays/quietwater-a-frame");
    expect([...url.searchParams.entries()]).toEqual([
      ["checkIn", "2028-06-10"], ["checkOut", "2028-06-15"], ["guests", "4"],
    ]);
  });

  it("omits empty or malformed context and safely encodes the slug", () => {
    expect(createStayHref("cabin/other", "?guests=0&checkIn=bad")).toBe("/stays/cabin%2Fother");
  });

  it("uses local calendar fields instead of the UTC ISO date", () => {
    const localDate = new Date(2028, 0, 2, 0, 15);
    localDate.toISOString = () => "2028-01-01T20:15:00.000Z";
    expect(localDateKey(localDate)).toBe("2028-01-02");
  });
});
