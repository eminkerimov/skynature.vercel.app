import {
  ArrowRight,
  CalendarCheck,
  Heart,
  House,
  Leaf,
  Mountain,
  Search,
  ShieldCheck,
  Sparkles,
  Tent,
  TreePine,
  Trees,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import forestRiverImage from "../../assets/images/landscapes/forest-river.webp";
import lakesideJettyImage from "../../assets/images/landscapes/lakeside-jetty.webp";
import mistyWoodlandImage from "../../assets/images/landscapes/misty-woodland.webp";
import mountainValleyImage from "../../assets/images/landscapes/mountain-valley.webp";
import Badge from "../../components/Badge/Badge";
import SearchBar from "../../components/SearchBar/SearchBar";
import StayCard from "../../components/StayCard/StayCard";
import { categories, destinations, stays } from "../../data/stays";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { StayType } from "../../types/stay";
import styles from "./HomePage.module.scss";

interface CategoryDetail {
  icon: LucideIcon;
  description: string;
}

const categoryDetails: Record<StayType, CategoryDetail> = {
  Cabin: {
    icon: TreePine,
    description: "Warm timber hideaways tucked into quiet landscapes.",
  },
  "Eco home": {
    icon: House,
    description: "Considered homes shaped around lighter-impact living.",
  },
  Glamping: {
    icon: Tent,
    description: "Immersive outdoor stays with the comforts that matter.",
  },
  Lakeside: {
    icon: Waves,
    description: "Calm waterside places made for unhurried mornings.",
  },
  "Mountain retreat": {
    icon: Mountain,
    description: "High-country bases with space to rest and reconnect.",
  },
  Treehouse: {
    icon: Trees,
    description: "Elevated escapes with a closer view of the canopy.",
  },
};

const destinationVisuals = [
  {
    region: "Scottish Highlands",
    image: forestRiverImage,
    alt: "A quiet river winding through a dense green forest",
  },
  {
    region: "Dolomites",
    image: mountainValleyImage,
    alt: "A green valley beneath dramatic mountain cliffs",
  },
  {
    region: "Finnish Lakeland",
    image: lakesideJettyImage,
    alt: "A wooden jetty reaching into a still mountain lake",
  },
  {
    region: "Black Forest",
    image: mistyWoodlandImage,
    alt: "A peaceful bench beneath trees in a misty woodland",
  },
].filter(({ region }) => destinations.includes(region));

const benefits = [
  {
    icon: Leaf,
    title: "Nature-first stays",
    copy: "Places selected for their setting, thoughtful footprint, and sense of calm.",
  },
  {
    icon: ShieldCheck,
    title: "Details you can trust",
    copy: "Clear amenities, house information, guest limits, and pricing before you book.",
  },
  {
    icon: Sparkles,
    title: "Spaces with character",
    copy: "Independent cabins, retreats, and hideaways that feel personal rather than generic.",
  },
];

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Find your setting",
    copy: "Search by destination, dates, and the kind of landscape you want around you.",
  },
  {
    icon: Heart,
    number: "02",
    title: "Keep the good ones",
    copy: "Save standout stays and return to your shortlist whenever inspiration strikes.",
  },
  {
    icon: CalendarCheck,
    number: "03",
    title: "Book with clarity",
    copy: "Review the full stay details, see your total, and confirm in a few simple steps.",
  },
];

export function HomePage() {
  useDocumentTitle("Home");

  const featuredStays = stays.filter((stay) => stay.featured).slice(0, 4);

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="home-hero-title">
        <div className={styles.container}>
          <div className={styles.heroFrame}>
            <img
              className={styles.heroImage}
              src={forestRiverImage}
              alt="A tranquil river flowing through an old green forest"
            />
            <div className={styles.heroShade} aria-hidden="true" />
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}>
                <Badge>Thoughtful stays, closer to nature</Badge>
              </div>
              <h1 id="home-hero-title">Find your place in nature</h1>
              <p>
                Discover characterful cabins, eco homes, and secluded retreats
                made for slower days outside.
              </p>
              <div className={styles.heroMeta} aria-label="SkyNature collection">
                <span>{stays.length} handpicked stays</span>
                <span aria-hidden="true" />
                <span>{destinations.length} remarkable regions</span>
              </div>
              <div className={styles.searchPanel}>
                <SearchBar />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.categoriesSection} aria-labelledby="categories-title">
        <div className={styles.container}>
          <div className={styles.sectionIntro}>
            <div>
              <span className={styles.kicker}>Stay your way</span>
              <h2 id="categories-title">A different rhythm for every escape</h2>
            </div>
            <p>
              From a simple forest cabin to a considered mountain house, choose
              the space that fits the way you want to switch off.
            </p>
          </div>

          <ul className={styles.categoryGrid}>
            {categories.map((category) => {
              const detail = categoryDetails[category];
              const Icon = detail.icon;

              return (
                <li key={category}>
                  <Link
                    className={styles.categoryCard}
                    to={`/explore?type=${encodeURIComponent(category)}`}
                  >
                    <span className={styles.categoryIcon} aria-hidden="true">
                      <Icon size={24} strokeWidth={1.8} />
                    </span>
                    <span className={styles.categoryName}>{category}</span>
                    <span className={styles.categoryCopy}>{detail.description}</span>
                    <ArrowRight className={styles.categoryArrow} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className={styles.featuredSection} aria-labelledby="featured-title">
        <div className={styles.container}>
          <div className={styles.sectionHeadingRow}>
            <div>
              <span className={styles.kicker}>Selected for you</span>
              <h2 id="featured-title">Featured stays</h2>
            </div>
            <Link className={styles.textLink} to="/explore">
              Explore all stays
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.staysGrid}>
            {featuredStays.map((stay) => (
              <StayCard key={stay.id} stay={stay} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.destinationsSection} aria-labelledby="destinations-title">
        <div className={styles.container}>
          <div className={styles.sectionIntro}>
            <div>
              <span className={styles.kicker}>Go somewhere memorable</span>
              <h2 id="destinations-title">Popular destinations</h2>
            </div>
            <p>
              Follow the landscape: deep woodland, open water, dramatic ridges,
              and regions where the pace naturally softens.
            </p>
          </div>

          <div className={styles.destinationGrid}>
            {destinationVisuals.map(({ region, image, alt }) => {
              const stayCount = stays.filter((stay) => stay.region === region).length;

              return (
                <Link
                  className={styles.destinationCard}
                  key={region}
                  to={`/explore?region=${encodeURIComponent(region)}`}
                >
                  <img src={image} alt={alt} />
                  <span className={styles.destinationShade} aria-hidden="true" />
                  <span className={styles.destinationContent}>
                    <span>
                      <strong>{region}</strong>
                      <small>
                        {stayCount} {stayCount === 1 ? "stay" : "stays"}
                      </small>
                    </span>
                    <span className={styles.destinationArrow} aria-hidden="true">
                      <ArrowRight size={20} />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.benefitsSection} aria-labelledby="benefits-title">
        <div className={styles.container}>
          <div className={styles.benefitsLayout}>
            <div className={styles.benefitsLead}>
              <Badge>Why SkyNature</Badge>
              <h2 id="benefits-title">Less noise. More of what brought you here.</h2>
              <p>
                We make it easier to compare distinctive nature stays without
                losing the details that make each place worth the journey.
              </p>
              <Link className={styles.lightLink} to="/explore">
                Start exploring
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>

            <ul className={styles.benefitsList}>
              {benefits.map(({ icon: Icon, title, copy }) => (
                <li key={title}>
                  <span className={styles.benefitIcon} aria-hidden="true">
                    <Icon size={24} strokeWidth={1.8} />
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <p>{copy}</p>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.howSection} aria-labelledby="how-title">
        <div className={styles.container}>
          <div className={styles.centeredHeading}>
            <span className={styles.kicker}>Simple by design</span>
            <h2 id="how-title">How it works</h2>
            <p>From first idea to confirmed escape in three calm steps.</p>
          </div>

          <ol className={styles.stepsGrid}>
            {steps.map(({ icon: Icon, number, title, copy }) => (
              <li key={number}>
                <span className={styles.stepNumber}>{number}</span>
                <span className={styles.stepIcon} aria-hidden="true">
                  <Icon size={25} strokeWidth={1.8} />
                </span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.testimonialsSection} aria-labelledby="stories-title">
        <div className={styles.container}>
          <div className={styles.testimonialsLayout}>
            <div className={styles.testimonialsIntro}>
              <span className={styles.kicker}>Guest notes</span>
              <h2 id="stories-title">Small moments that stay with you</h2>
              <p>
                The best escapes are often remembered through a view, a quiet
                morning, or the feeling of having nowhere else to be.
              </p>
            </div>

            <div className={styles.quotesGrid}>
              <figure>
                <blockquote>
                  “The cabin was beautifully considered, but it was the silence
                  beyond the deck that made the weekend feel genuinely rare.”
                </blockquote>
                <figcaption>
                  <span>MC</span>
                  <strong>Maya C.</strong>
                </figcaption>
              </figure>
              <figure>
                <blockquote>
                  “We saved three places, compared the details in one evening,
                  and found exactly the kind of lakeside break we needed.”
                </blockquote>
                <figcaption>
                  <span>ER</span>
                  <strong>Elena R.</strong>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection} aria-labelledby="cta-title">
        <div className={styles.container}>
          <div className={styles.ctaPanel}>
            <div>
              <span>Ready when you are</span>
              <h2 id="cta-title">Your next good story starts outdoors.</h2>
              <p>
                Browse the full collection and find a stay that gives you room
                to breathe.
              </p>
            </div>
            <Link className={styles.ctaButton} to="/explore">
              Find a stay
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
