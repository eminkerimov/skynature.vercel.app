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
import Badge from "../../components/Badge/Badge";
import SearchBar from "../../components/SearchBar/SearchBar";
import StayCard from "../../components/StayCard/StayCard";
import { useProjectData } from "../../context/ProjectDataContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import styles from "./HomePage.module.scss";

const homeIcons: Record<string, LucideIcon> = {
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
};

function resolveHomeIcon(name: string): LucideIcon {
  return Object.hasOwn(homeIcons, name) ? homeIcons[name] : Leaf;
}

export function HomePage() {
  useDocumentTitle("Home");
  const { stays, categories, destinations, home, site, numbers, settings } = useProjectData();

  const featuredStays = stays
    .filter((stay) => stay.featured)
    .slice(0, home.sections.featured.limit);
  const destinationVisuals = home.destinationVisuals.filter(({ region }) =>
    destinations.includes(region),
  );
  const numberFormatter = new Intl.NumberFormat(settings.locale);

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="home-hero-title">
        <div className={styles.container}>
          <div className={styles.heroFrame}>
            <img
              className={styles.heroImage}
              src={home.hero.image}
              alt={home.hero.alt}
            />
            <div className={styles.heroShade} aria-hidden="true" />
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}>
                <Badge>{home.hero.badge}</Badge>
              </div>
              <h1 id="home-hero-title">{home.hero.title}</h1>
              <p>{home.hero.description}</p>
              <div className={styles.heroMeta} aria-label={`${site.name} collection`}>
                <span>{numberFormatter.format(numbers.stays)} handpicked stays</span>
                <span aria-hidden="true" />
                <span>{numberFormatter.format(numbers.regions)} remarkable regions</span>
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
              <span className={styles.kicker}>{home.sections.categories.eyebrow}</span>
              <h2 id="categories-title">{home.sections.categories.title}</h2>
            </div>
            <p>{home.sections.categories.description}</p>
          </div>

          <ul className={styles.categoryGrid}>
            {categories.map((category) => {
              const detail = home.categoryDetails[category];
              const Icon = resolveHomeIcon(detail.icon);

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
              <span className={styles.kicker}>{home.sections.featured.eyebrow}</span>
              <h2 id="featured-title">{home.sections.featured.title}</h2>
            </div>
            <Link className={styles.textLink} to={home.sections.featured.href}>
              {home.sections.featured.linkLabel}
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
              <span className={styles.kicker}>{home.sections.destinations.eyebrow}</span>
              <h2 id="destinations-title">{home.sections.destinations.title}</h2>
            </div>
            <p>{home.sections.destinations.description}</p>
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
                        {numberFormatter.format(stayCount)} {stayCount === 1 ? "stay" : "stays"}
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
              <Badge>{home.sections.benefits.eyebrow}</Badge>
              <h2 id="benefits-title">{home.sections.benefits.title}</h2>
              <p>{home.sections.benefits.description}</p>
              <Link className={styles.lightLink} to={home.sections.benefits.href}>
                {home.sections.benefits.linkLabel}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>

            <ul className={styles.benefitsList}>
              {home.benefits.map(({ icon, title, copy }) => {
                const Icon = resolveHomeIcon(icon);

                return (
                  <li key={title}>
                    <span className={styles.benefitIcon} aria-hidden="true">
                      <Icon size={24} strokeWidth={1.8} />
                    </span>
                    <span>
                      <strong>{title}</strong>
                      <p>{copy}</p>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.howSection} aria-labelledby="how-title">
        <div className={styles.container}>
          <div className={styles.centeredHeading}>
            <span className={styles.kicker}>{home.sections.steps.eyebrow}</span>
            <h2 id="how-title">{home.sections.steps.title}</h2>
            <p>{home.sections.steps.description}</p>
          </div>

          <ol className={styles.stepsGrid}>
            {home.steps.map(({ icon, number, title, copy }) => {
              const Icon = resolveHomeIcon(icon);

              return (
                <li key={number}>
                  <span className={styles.stepNumber}>{number}</span>
                  <span className={styles.stepIcon} aria-hidden="true">
                    <Icon size={25} strokeWidth={1.8} />
                  </span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className={styles.testimonialsSection} aria-labelledby="stories-title">
        <div className={styles.container}>
          <div className={styles.testimonialsLayout}>
            <div className={styles.testimonialsIntro}>
              <span className={styles.kicker}>{home.sections.testimonials.eyebrow}</span>
              <h2 id="stories-title">{home.sections.testimonials.title}</h2>
              <p>{home.sections.testimonials.description}</p>
            </div>

            <div className={styles.quotesGrid}>
              {home.testimonials.map(({ quote, author, initials }) => (
                <figure key={author}>
                  <blockquote>“{quote}”</blockquote>
                  <figcaption>
                    <span>{initials}</span>
                    <strong>{author}</strong>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection} aria-labelledby="cta-title">
        <div className={styles.container}>
          <div className={styles.ctaPanel}>
            <div>
              <span>{home.cta.eyebrow}</span>
              <h2 id="cta-title">{home.cta.title}</h2>
              <p>{home.cta.description}</p>
            </div>
            <Link className={styles.ctaButton} to={home.cta.href}>
              {home.cta.label}
              <ArrowRight size={19} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
