import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getCachedProjectData, loadProjectData } from "../services/projectData";
import type { SkyNatureData } from "../types/projectData";
import styles from "../App.module.scss";

export const ProjectDataContext = createContext<SkyNatureData | undefined>(undefined);

type LoadState =
  | { status: "loading" }
  | { status: "ready"; data: SkyNatureData }
  | { status: "error" };

export function ProjectDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LoadState>(() => {
    const data = getCachedProjectData();
    return data ? { status: "ready", data } : { status: "loading" };
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    loadProjectData().then(
      (data) => { if (active) setState({ status: "ready", data }); },
      () => { if (active) setState({ status: "error" }); },
    );
    return () => { active = false; };
  }, [attempt]);

  if (state.status === "loading") {
    return (
      <div className={styles.loader} role="status" aria-live="polite">
        <span className={styles.loaderMark} aria-hidden="true" />
        <span>Finding a quiet place…</span>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <main className={`${styles.loader} ${styles.loadError}`} role="alert">
        <h1>We couldn’t load the stays</h1>
        <p>Check your connection and try again.</p>
        <button type="button" className={styles.retryButton} onClick={() => {
          setState({ status: "loading" });
          setAttempt((current) => current + 1);
        }}>Try again</button>
      </main>
    );
  }

  return <ProjectDataContext.Provider value={state.data}>{children}</ProjectDataContext.Provider>;
}

export function useProjectData() {
  const data = useContext(ProjectDataContext);
  if (!data) throw new Error("useProjectData must be used inside ProjectDataProvider.");
  return data;
}
