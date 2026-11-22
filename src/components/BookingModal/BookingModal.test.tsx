import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProjectDataTestProvider, projectData } from "../../test/projectData";
import { formatCurrency } from "../../utils/formatters";
import { localDateKey, readBookingSearch } from "../../utils/staySearch";
import BookingModal from "./BookingModal";

const stay = projectData.stays[0];

function renderBooking(
  data = projectData,
  initialValues?: { checkIn?: string; checkOut?: string; guests?: number | null },
) {
  return render(
    <ProjectDataTestProvider data={data}>
      <BookingModal stay={stay} open onClose={vi.fn()} initialValues={initialValues} />
    </ProjectDataTestProvider>,
  );
}

function dateFromToday(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return localDateKey(date);
}

function getBookingDetails() {
  const nights = Math.max(stay.stayInfo.minimumNights, 3);

  return {
    checkIn: dateFromToday(10),
    checkOut: dateFromToday(10 + nights),
    guests: Math.min(stay.maxGuests, 3),
    nights,
  };
}

async function completeValidForm() {
  const user = userEvent.setup();
  const details = getBookingDetails();
  const checkInInput = screen.getByLabelText("Check-in");
  const checkOutInput = screen.getByLabelText("Check-out");

  fireEvent.input(checkInInput, {
    target: { value: details.checkIn },
  });
  fireEvent.input(checkOutInput, {
    target: { value: details.checkOut },
  });
  await user.selectOptions(
    screen.getByLabelText("Guests"),
    String(details.guests),
  );
  await user.type(screen.getByLabelText("Name"), "Alex Morgan");
  await user.type(screen.getByLabelText("Email"), "alex@example.com");

  return { user, ...details };
}

describe("BookingModal", () => {
  it("prefills booking context handed off from the search URL", () => {
    const { checkIn, checkOut, guests, nights } = getBookingDetails();
    renderBooking(projectData, readBookingSearch(`?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`));

    expect(screen.getByLabelText("Check-in")).toHaveValue(checkIn);
    expect(screen.getByLabelText("Check-out")).toHaveValue(checkOut);
    expect(screen.getByLabelText("Guests")).toHaveValue(String(guests));
    const subtotal = nights * stay.price;
    const { cleaningFee, serviceFeeRate } = projectData.settings.booking;
    const total = subtotal + cleaningFee + Math.round(subtotal * serviceFeeRate);
    expect(screen.getByText("Total").parentElement).toHaveTextContent(formatCurrency(total));
  });

  it("clamps a prefilled group to the stay capacity", () => {
    renderBooking(projectData, { guests: stay.maxGuests + 10 });
    expect(screen.getByLabelText("Guests")).toHaveValue(String(stay.maxGuests));
  });

  it("ignores malformed initial dates and invalid guest counts", () => {
    renderBooking(projectData, { checkIn: "2027-02-29", checkOut: "2027-03-05", guests: -1 });
    expect(screen.getByLabelText("Check-in")).toHaveValue("");
    expect(screen.getByLabelText("Check-out")).toHaveValue("");
    expect(screen.getByLabelText("Guests")).toHaveValue(String(projectData.settings.booking.defaultGuests));
  });

  it("does not erase typed fields when equivalent initial values are rerendered", async () => {
    const user = userEvent.setup();
    const { checkIn, checkOut, guests } = getBookingDetails();
    const view = renderBooking(projectData, { checkIn, checkOut, guests });
    await user.type(screen.getByLabelText("Name"), "Alex Morgan");
    view.rerender(
      <ProjectDataTestProvider>
        <BookingModal stay={stay} open onClose={vi.fn()} initialValues={{ checkIn, checkOut, guests }} />
      </ProjectDataTestProvider>,
    );
    expect(screen.getByLabelText("Name")).toHaveValue("Alex Morgan");
  });

  it("reopens with the current URL context after a closed modal was updated", () => {
    const first = getBookingDetails();
    const view = renderBooking(projectData, first);
    const next = { checkIn: dateFromToday(20), checkOut: dateFromToday(25), guests: 1 };
    const modal = (open: boolean) => (
      <ProjectDataTestProvider>
        <BookingModal stay={stay} open={open} onClose={vi.fn()} initialValues={next} />
      </ProjectDataTestProvider>
    );
    view.rerender(modal(false));
    view.rerender(modal(true));
    expect(screen.getByLabelText("Check-in")).toHaveValue(next.checkIn);
    expect(screen.getByLabelText("Check-out")).toHaveValue(next.checkOut);
    expect(screen.getByLabelText("Guests")).toHaveValue("1");
  });

  it("uses the local calendar date for the minimum check-in", () => {
    const iso = vi.spyOn(Date.prototype, "toISOString").mockReturnValue("1999-01-01T00:00:00.000Z");
    try {
      renderBooking();
      expect(screen.getByLabelText("Check-in")).toHaveAttribute("min", localDateKey());
    } finally {
      iso.mockRestore();
    }
  });

  it("shows validation errors after submitting an empty form", async () => {
    const user = userEvent.setup();
    renderBooking();

    await user.click(screen.getByRole("button", { name: "Request booking" }));

    expect(screen.getByText("Choose a check-in date.")).toBeInTheDocument();
    expect(screen.getByText("Choose a check-out date.")).toBeInTheDocument();
    expect(screen.getByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
  });

  it("keeps focus in name and email while typing each character", async () => {
    const user = userEvent.setup();
    renderBooking();
    const nameInput = screen.getByLabelText("Name");
    const emailInput = screen.getByLabelText("Email");

    await user.type(nameInput, "Alex Morgan");

    expect(nameInput).toHaveValue("Alex Morgan");
    expect(nameInput).toHaveFocus();

    await user.type(emailInput, "alex@example.com");

    expect(emailInput).toHaveValue("alex@example.com");
    expect(emailInput).toHaveFocus();
  });

  it("calculates the total for valid booking details", async () => {
    renderBooking();
    const { checkIn, checkOut, guests, nights } = await completeValidForm();
    const subtotal = nights * stay.price;
    const expectedTotal = subtotal + 45 + Math.round(subtotal * 0.12);
    const totalRow = screen.getByText("Total").parentElement;

    expect(screen.getByLabelText("Check-in")).toHaveValue(checkIn);
    expect(screen.getByLabelText("Check-out")).toHaveValue(checkOut);
    expect(screen.getByLabelText("Guests")).toHaveValue(String(guests));
    expect(screen.getByLabelText("Name")).toHaveValue("Alex Morgan");
    expect(screen.getByLabelText("Email")).toHaveValue("alex@example.com");
    expect(totalRow).not.toBeNull();
    expect(
      within(totalRow!).getByText(formatCurrency(expectedTotal)),
    ).toBeInTheDocument();
  });

  it("uses booking defaults, fees, locale, and currency from project data", async () => {
    const data = {
      ...projectData,
      settings: {
        ...projectData.settings,
        locale: "de-DE",
        currency: "EUR",
        booking: {
          cleaningFee: 27,
          serviceFeeRate: 0.2,
          defaultGuests: 1,
        },
      },
    };
    renderBooking(data);
    expect(screen.getByLabelText("Guests")).toHaveValue("1");

    const { nights } = await completeValidForm();
    const subtotal = nights * stay.price;
    const expectedTotal = subtotal + 27 + Math.round(subtotal * 0.2);
    const formattedTotal = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(expectedTotal);

    expect(screen.getByText("Total").parentElement?.textContent).toBe(`Total${formattedTotal}`);
  });

  it("shows the success state and demo payment note after a valid submission", async () => {
    renderBooking();
    const { user } = await completeValidForm();

    await user.click(screen.getByRole("button", { name: "Request booking" }));

    expect(
      screen.getByRole("heading", { name: "Request received" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Your nature break is one step closer",
    );
    expect(
      screen.getByText("This is a demo booking. No payment has been taken."),
    ).toBeInTheDocument();
  });
});
