import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout/AppLayout";
import { ProjectDataProvider } from "./context/ProjectDataContext";
import { CompareProvider } from "./context/CompareContext";
import { ToastProvider } from "./context/ToastContext";
import styles from "./App.module.scss";

const HomePage = lazy(() => import("./pages/Home/HomePage"));
const ExplorePage = lazy(() => import("./pages/Explore/ExplorePage"));
const StayPage = lazy(() => import("./pages/Stay/StayPage"));
const SavedPage = lazy(() => import("./pages/Saved/SavedPage"));
const ComparePage = lazy(() => import("./pages/Compare/ComparePage"));
const AboutPage = lazy(() => import("./pages/About/AboutPage"));
const NotFoundPage = lazy(() => import("./pages/NotFound/NotFoundPage"));

function PageLoader() {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <span className={styles.loaderMark} aria-hidden="true" />
      <span>Finding a quiet place…</span>
    </div>
  );
}

export default function App() {
  return (
    <ProjectDataProvider>
      <ToastProvider>
        <CompareProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="explore" element={<ExplorePage />} />
                <Route path="stays/:slug" element={<StayPage />} />
                <Route path="saved" element={<SavedPage />} />
                <Route path="compare" element={<ComparePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
        </CompareProvider>
      </ToastProvider>
    </ProjectDataProvider>
  );
}
