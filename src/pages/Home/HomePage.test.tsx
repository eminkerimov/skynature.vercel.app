import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { FavoritesProvider } from "../../context/FavoritesContext";
import { projectData, ProjectDataTestProvider } from "../../test/projectData";
import HomePage from "./HomePage";

describe("HomePage project data", () => {
  it("renders supplied content and images, respects the featured limit, and tolerates unknown icons", () => {
    const data = {
      ...projectData,
      site: { ...projectData.site, name: "Field Notes" },
      home: {
        ...projectData.home,
        hero: {
          ...projectData.home.hero,
          title: "A quiet escape from the API",
          description: "Discover the collection supplied by project data.",
          image: "https://dbem.pages.dev/skynature/images/forest-river.webp?home-test",
          alt: "A woodland river supplied by project data",
        },
        categoryDetails: {
          ...projectData.home.categoryDetails,
          Cabin: { ...projectData.home.categoryDetails.Cabin, icon: "__proto__" },
        },
        sections: {
          ...projectData.home.sections,
          featured: { ...projectData.home.sections.featured, limit: 2 },
        },
      },
    };

    render(
      <MemoryRouter>
        <ProjectDataTestProvider data={data}>
          <FavoritesProvider>
            <HomePage />
          </FavoritesProvider>
        </ProjectDataTestProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { level: 1, name: data.home.hero.title })).toBeInTheDocument();
    expect(screen.getByText(data.home.hero.description)).toBeInTheDocument();
    expect(screen.getByLabelText("Field Notes collection")).toHaveTextContent(
      `${data.numbers.stays} handpicked stays`,
    );
    expect(screen.getByRole("img", { name: data.home.hero.alt })).toHaveAttribute("src", data.home.hero.image);

    const categories = screen.getByRole("region", { name: data.home.sections.categories.title });
    expect(within(categories).getByRole("link", { name: /Cabin/ })).toHaveAttribute(
      "href",
      "/explore?type=Cabin",
    );

    const featured = screen.getByRole("region", { name: data.home.sections.featured.title });
    expect(within(featured).getAllByRole("article")).toHaveLength(2);
    for (const stay of data.stays.filter((item) => item.featured).slice(0, 2)) {
      expect(within(featured).getByRole("heading", { name: stay.name })).toBeInTheDocument();
    }
  });
});
