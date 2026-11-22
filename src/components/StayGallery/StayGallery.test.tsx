import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import StayGallery from "./StayGallery";

const images = ["Exterior", "Living room", "Bedroom", "Sauna", "Private deck"].map((alt, index) => ({
  url: `https://dbem.pages.dev/skynature/images/stay-01-photo-${index + 1}.webp`,
  alt,
}));

describe("StayGallery", () => {
  it("keeps all five previews accessible and opens the exact clicked photo", async () => {
    const user = userEvent.setup();
    render(<StayGallery title="Woodland Lodge" images={images} />);
    const gallery = screen.getByRole("region", { name: "Woodland Lodge photo gallery" });

    expect(within(gallery).getAllByRole("img")).toHaveLength(5);
    for (const image of images) expect(within(gallery).getByRole("img", { name: image.alt })).toBeInTheDocument();

    await user.click(within(gallery).getByRole("button", { name: /^Open photo 3 of 5:/ }));
    const dialog = screen.getByRole("dialog", { name: "Woodland Lodge photos" });
    expect(within(dialog).getByRole("img", { name: "Bedroom" })).toHaveAttribute("src", images[2].url);

    await user.click(within(dialog).getByRole("button", { name: "Next photo" }));
    expect(within(dialog).getByRole("img", { name: "Sauna" })).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Previous photo" }));
    expect(within(dialog).getByRole("img", { name: "Bedroom" })).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Show photo 5 of 5" }));
    expect(within(dialog).getByRole("img", { name: "Private deck" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Show photo 5 of 5" })).toHaveAttribute("aria-current", "true");
  });

  it("supports arrow keys, traps focus, and restores focus after Escape", async () => {
    const user = userEvent.setup();
    render(<StayGallery title="Woodland Lodge" images={images} />);
    const trigger = screen.getByRole("button", { name: /^Open photo 1 of 5:/ });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Woodland Lodge photos" });
    const close = within(dialog).getByRole("button", { name: "Close dialog" });
    await waitFor(() => expect(close).toHaveFocus());

    await user.tab({ shift: true });
    expect(within(dialog).getByRole("button", { name: "Show photo 5 of 5" })).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(within(dialog).getByRole("img", { name: "Private deck" })).toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    expect(within(dialog).getByRole("img", { name: "Exterior" })).toBeInTheDocument();
    expect(close).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body).not.toHaveClass("modal-open");
  });

  it("updates the swipe counter and opens All photos at the visible preview", async () => {
    const user = userEvent.setup();
    render(<StayGallery title="Woodland Lodge" images={images} />);
    const previews = screen.getByRole("group", { name: "Photo previews" });
    Object.defineProperty(previews, "clientWidth", { configurable: true, value: 400 });

    fireEvent.scroll(previews, { target: { scrollLeft: 800 } });

    expect(screen.getByLabelText("Current photo")).toHaveTextContent("3 / 5");
    await user.click(screen.getByRole("button", { name: "All photos" }));
    const dialog = screen.getByRole("dialog", { name: "Woodland Lodge photos" });
    expect(within(dialog).getByRole("img", { name: "Bedroom" })).toBeInTheDocument();
  });

  it("swipes fullscreen photos in both directions and ignores vertical, short, and button gestures", async () => {
    const user = userEvent.setup();
    render(<StayGallery title="Woodland Lodge" images={images} />);
    await user.click(screen.getByRole("button", { name: "All photos" }));
    const dialog = screen.getByRole("dialog", { name: "Woodland Lodge photos" });
    const stage = within(dialog).getByRole("group", { name: "Full-size photo" });
    const swipe = (target: HTMLElement, from: [number, number], to: [number, number]) => {
      fireEvent.touchStart(target, { touches: [{ clientX: from[0], clientY: from[1] }] });
      fireEvent.touchEnd(target, { changedTouches: [{ clientX: to[0], clientY: to[1] }] });
    };

    swipe(stage, [200, 100], [100, 110]);
    expect(within(dialog).getByRole("img", { name: "Living room" })).toBeInTheDocument();
    swipe(stage, [100, 100], [180, 110]);
    expect(within(dialog).getByRole("img", { name: "Exterior" })).toBeInTheDocument();

    swipe(stage, [200, 100], [120, 240]);
    swipe(stage, [200, 100], [170, 102]);
    swipe(within(dialog).getByRole("button", { name: "Next photo" }), [200, 100], [100, 100]);
    expect(within(dialog).getByRole("img", { name: "Exterior" })).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Next photo" }));
    expect(within(dialog).getByRole("img", { name: "Living room" })).toBeInTheDocument();
  });
});
