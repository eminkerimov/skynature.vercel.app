import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { useProjectData } from "../../context/ProjectDataContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import styles from "./NotFoundPage.module.scss";

export function NotFoundPage() {
  const { images, home } = useProjectData();
  const mistyWoodlandImage = images.find((image) => image.id === "misty-woodland")?.url ?? home.hero.image;
  useDocumentTitle("Page not found");

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="not-found-title">
        <div className={styles.imageWrap} aria-hidden="true">
          <img src={mistyWoodlandImage} alt="" />
          <span />
        </div>
        <div className={styles.content}>
          <span className={styles.icon} aria-hidden="true">
            <Compass size={28} strokeWidth={1.7} />
          </span>
          <p className={styles.code}>404 · Off the map</p>
          <h1 id="not-found-title">This trail ends here.</h1>
          <p className={styles.message}>
            The page you are looking for may have moved, or the path may no
            longer exist. Let’s return somewhere familiar.
          </p>
          <Link className={styles.homeLink} to="/">
            <ArrowLeft size={18} aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default NotFoundPage;
