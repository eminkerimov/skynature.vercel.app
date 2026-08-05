import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { stays } from "../../data/stays";
import { formatCurrency } from "../../utils/formatters";
import BookingModal from "./BookingModal";

const stay = stays[0];

function dateFromToday(offset: number) {
  const date = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
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
  fireEvent.input(screen.getByLabelText("Name"), {
    target: { value: "Alex Morgan" },
  });
  fireEvent.input(screen.getByLabelText("Email"), {
    target: { value: "alex@example.com" },
  });

  return { user, ...details };
}

describe("BookingModal", () => {
  it("shows validation errors after submitting an empty form", async () => {
    const user = userEvent.setup();
    render(<BookingModal stay={stay} open onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Request booking" }));

    expect(screen.getByText("Choose a check-in date.")).toBeInTheDocument();
    expect(screen.getByText("Choose a check-out date.")).toBeInTheDocument();
    expect(screen.getByText("Enter your full name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
  });

  it("calculates the total for valid booking details", async () => {
    render(<BookingModal stay={stay} open onClose={vi.fn()} />);
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

  it("shows the success state and demo payment note after a valid submission", async () => {
    render(<BookingModal stay={stay} open onClose={vi.fn()} />);
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
