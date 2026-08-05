import forestRiverImage from "../assets/images/landscapes/forest-river.webp";
import lakesideJettyImage from "../assets/images/landscapes/lakeside-jetty.webp";
import mistyWoodlandImage from "../assets/images/landscapes/misty-woodland.webp";
import mountainValleyImage from "../assets/images/landscapes/mountain-valley.webp";

type StayImageKind = "cover" | "detail";
type Scenery = "forest" | "lake" | "mountain";

const generatedImages = import.meta.glob<string>(
  "../assets/images/stays/generated/*.webp",
  { eager: true, import: "default" },
);

const sceneryImages: Record<Scenery, [string, string]> = {
  forest: [mistyWoodlandImage, forestRiverImage],
  lake: [lakesideJettyImage, forestRiverImage],
  mountain: [mountainValleyImage, forestRiverImage],
};

const getGeneratedImage = (slug: string, kind: StayImageKind) => {
  const path = `../assets/images/stays/generated/${slug}-${kind}.webp`;
  const image = generatedImages[path];

  if (!image) {
    throw new Error(`Missing generated image: ${path}`);
  }

  return image;
};

export const getStayCover = (slug: string) =>
  getGeneratedImage(slug, "cover");

export const getStayGallery = (
  slug: string,
  scenery: Scenery,
): string[] => [
  getGeneratedImage(slug, "cover"),
  getGeneratedImage(slug, "detail"),
  ...sceneryImages[scenery],
];
