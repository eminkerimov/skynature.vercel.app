import { Heart, Search } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/Badge/Badge";
import StayCard from "../../components/StayCard/StayCard";
import { stays } from "../../data/stays";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useFavorites } from "../../hooks/useFavorites";
import styles from "./SavedPage.module.scss";

export function SavedPage() {
  useDocumentTitle("Saved stays");

  const { ids } = useFavorites();
  const savedStays = useMemo(() => {
    const savedIds = new Set(ids);
    return stays.filter((stay) => savedIds.has(stay.id));
  }, [ids]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.container}>
          <Badge>Your shortlist</Badge>
          <h1>Saved stays</h1>
          <p>
            Keep the places that caught your eye together, then return when the
            moment feels right.
          </p>
        </div>
      </header>

      <div className={`${styles.container} ${styles.content}`}>
        {savedStays.length > 0 ? (
          <section aria-labelledby="saved-results-title">
            <div className={styles.resultsHeading}>
              <div>
                <h2 id="saved-results-title">Places worth returning to</h2>
                <p>
                  {savedStays.length} saved {savedStays.length === 1 ? "stay" : "stays"}
                </p>
              </div>
              <Link className={styles.exploreLink} to="/explore">
                <Search size={18} aria-hidden="true" />
                Explore more
              </Link>
            </div>

            <div className={styles.grid}>
              {savedStays.map((stay) => (
                <StayCard key={stay.id} stay={stay} />
              ))}
            </div>
          </section>
        ) : (
          <section className={styles.emptyState} aria-labelledby="saved-empty-title">
            <div className={styles.emptyIcon} aria-hidden="true">
              <Heart size={32} strokeWidth={1.7} />
            </div>
            <span className={styles.emptyKicker}>Your collection starts here</span>
            <h2 id="saved-empty-title">No saved stays yet</h2>
            <p>
              Tap the heart on any place you love. It will wait here while you
              plan the rest of the journey.
            </p>
            <Link className={styles.emptyButton} to="/explore">
              Explore nature stays
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}

export default SavedPage;
