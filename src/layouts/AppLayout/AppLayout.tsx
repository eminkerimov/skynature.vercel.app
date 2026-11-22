import { Outlet, useLocation } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ScrollToTop from "../../components/ScrollToTop/ScrollToTop";
import CompareBar from "../../components/CompareBar/CompareBar";
import { useCompare } from "../../hooks/useCompare";
import styles from "./AppLayout.module.scss";

export default function AppLayout() {
  const { pathname } = useLocation();
  const { ids } = useCompare();
  const compareVisible = ids.length > 0 && pathname.replace(/\/+$/, "") !== "/compare";
  return (
    <div className={`${styles.app} ${compareVisible ? styles.compareSpace : ""} ${pathname.startsWith("/stays/") ? styles.bookingSpace : ""}`}>
      <ScrollToTop />
      <Header />
      <div className={styles.main}>
        <Outlet />
      </div>
      <Footer />
      <CompareBar />
    </div>
  );
}
