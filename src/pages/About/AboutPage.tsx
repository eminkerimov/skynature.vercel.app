import { ArrowDown, ArrowUpRight, Check, Heart, Layers3, MoveUpRight, Trees } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useProjectData } from "../../context/ProjectDataContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import styles from "./AboutPage.module.scss";

const sceneDefinitions = [
  { id: "misty-woodland", type: "Cabin", label: "Forest escapes", note: "Room to breathe", number: "01" },
  { id: "lakeside-jetty", type: "Lakeside", label: "By the water", note: "A different kind of flow", number: "02" },
  { id: "mountain-valley", type: "Mountain retreat", label: "Higher ground", note: "A little more perspective", number: "03" },
];

export default function AboutPage() {
  useDocumentTitle("About");
  const { site, home, images, stays, numbers, settings } = useProjectData();
  const [activeScene, setActiveScene] = useState(0);
  const scenes = sceneDefinitions.map((scene) => ({
    ...scene,
    image: images.find((image) => image.id === scene.id),
  }));
  const cabin = stays.find((stay) => stay.type === "Cabin") ?? stays[0];
  const cabinImage = images.find((image) => image.url === cabin?.image);
  const formatNumber = new Intl.NumberFormat(settings.locale);

  return (
    <main className={styles.page}>
      <section className={styles.container + " " + styles.hero} aria-labelledby="about-title">
        <div className={styles.topLine}>
          <span className={styles.eyebrow}><span aria-hidden="true" />About {site.name}</span>
          <span className={styles.edition}>Made for life outside.</span>
        </div>
        <div className={styles.heroIntro}>
          <h1 id="about-title">Less screen.{" "}<span>More green.</span></h1>
          <div className={styles.heroCopy}>
            <p>We bring together places that make getting away feel like coming back to yourself.</p>
            <Link className={styles.primaryLink} to="/explore">Find your escape<span><ArrowUpRight size={19} aria-hidden="true" /></span></Link>
          </div>
        </div>
        <div className={styles.sceneDeck} role="group" aria-label="Choose your kind of escape">
          {scenes.map((scene, index) => (
            <Link
              key={scene.id}
              to={"/explore?type=" + encodeURIComponent(scene.type)}
              className={styles.scene + (activeScene === index ? " " + styles.activeScene : "")}
              aria-label={"Explore " + scene.label.toLowerCase()}
              onFocus={() => setActiveScene(index)}
              onPointerEnter={(event) => { if (event.pointerType === "mouse") setActiveScene(index); }}
            >
              <img src={scene.image?.url ?? home.hero.image} alt={scene.image?.alt ?? home.hero.alt} fetchPriority={index === 0 ? "high" : "auto"} />
              <span className={styles.sceneShade} aria-hidden="true" />
              <span className={styles.sceneTop}><span>{scene.number} / OUTSIDE</span><ArrowUpRight size={21} aria-hidden="true" /></span>
              <span className={styles.sceneCaption}><strong>{scene.label}</strong><span>{scene.note}</span></span>
            </Link>
          ))}
        </div>
        <div className={styles.heroBottom}>
          <span><span className={styles.greenDot} aria-hidden="true" />{formatNumber.format(numbers.stays)} places. Endless ways to switch off.</span>
          <a href="#our-idea">Meet {site.name}<ArrowDown size={15} aria-hidden="true" /></a>
        </div>
      </section>

      <section id="our-idea" className={styles.story} aria-labelledby="idea-title">
        <div className={styles.container + " " + styles.storyLayout}>
          <div className={styles.storyHeading}>
            <span className={styles.eyebrow}>01 / Why we're here</span>
            <h2 id="idea-title">Getting away.<br /><span>Coming back<br />to yourself.</span></h2>
          </div>
          <div className={styles.storyCopy}>
            <p className={styles.storyLead}>A great stay changes more than your location.</p>
            <p>It is a slower morning. A longer walk. An evening that does not need a plan. {site.name} brings cabins, treehouses, and nature hideaways into one place, so you can spend less time searching and more time looking forward to the outside.</p>
            <dl className={styles.stats} aria-label="The SkyNature collection">
              <div><dt>Places with character</dt><dd>{formatNumber.format(numbers.stays)}</dd></div>
              <div><dt>Remarkable regions</dt><dd>{formatNumber.format(numbers.regions)}</dd></div>
              <div><dt>Ways to stay</dt><dd>{formatNumber.format(numbers.categories)}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className={styles.container + " " + styles.approach} aria-labelledby="approach-title">
        <div className={styles.sectionHeader}>
          <div><span className={styles.eyebrow}>02 / The way we see it</span><h2 id="approach-title">Good places.<br />Zero overthinking.</h2></div>
          <p>A little character. A lot of nature.<br />The details you need, all in one place.</p>
        </div>
        <div className={styles.bento}>
          <article className={styles.placeCard}>
            <img src={cabin?.image ?? home.hero.image} alt={cabinImage?.alt ?? cabin?.name ?? home.hero.alt} loading="lazy" />
            <div className={styles.placeShade} aria-hidden="true" />
            <span className={styles.photoTag}><Trees size={15} aria-hidden="true" />Character comes naturally</span>
            <div className={styles.placeContent}><span>01 / THE PLACE</span><h3>Somewhere<br />worth finding.</h3><p>Cabins, canvas, and treetops.<br />Find a place with a personality of its own.</p></div>
          </article>
          <article className={styles.detailCard}>
            <span className={styles.cardNumber}>02 / THE DETAILS<Layers3 size={20} aria-hidden="true" /></span>
            <h3>A closer look.<br />A clearer choice.</h3>
            <p>Photos, amenities, house rules, and prices. Get to know a place before it makes your shortlist.</p>
            <ul className={styles.detailList}>
              <li><Check size={16} aria-hidden="true" />Five photos of every stay</li>
              <li><Check size={16} aria-hidden="true" />Capacity and amenities upfront</li>
              <li><Check size={16} aria-hidden="true" />House policies in plain sight</li>
            </ul>
          </article>
          <article className={styles.shortlistCard}>
            <span className={styles.cardNumber}>03 / YOUR PACE<Heart size={20} aria-hidden="true" /></span>
            <h3>Save a little.<br />Dream a little.</h3>
            <p>No need to decide right now. Keep the places you love and compare your favourites when you are ready.</p>
            <div className={styles.shortlistActions}><Link to="/saved">Saved stays<ArrowUpRight size={17} aria-hidden="true" /></Link><Link to="/compare">Compare<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
          </article>
        </div>
      </section>

      <section className={styles.container + " " + styles.cta} aria-labelledby="about-cta-title">
        <div><span className={styles.eyebrow}>More outside. Less everyday.</span><h2 id="about-cta-title">Your next reset<br />is <span>out there.</span></h2></div>
        <Link className={styles.collectionLink} to="/explore"><span>Explore the collection</span><MoveUpRight size={38} strokeWidth={1.6} aria-hidden="true" /></Link>
      </section>
      {site.isDemo && <p className={styles.container + " " + styles.demoNote}>A demo collection of fictional stays. Booking requests are not sent and no payments are taken.</p>}
    </main>
  );
}
