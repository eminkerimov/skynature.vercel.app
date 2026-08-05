import { useEffect, useState } from "react";
import { Heart, Menu, X } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import Brand from "../Brand/Brand";
import { useFavorites } from "../../hooks/useFavorites";
import styles from "./Header.module.scss";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/explore", label: "Explore", end: false },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { ids } = useFavorites();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Brand />
        <button
          type="button"
          className={styles.menuButton}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav
          id="primary-navigation"
          aria-label="Primary navigation"
          className={`${styles.navigation} ${open ? styles.open : ""}`}
        >
          <div className={styles.links}>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.active : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <NavLink
            to="/saved"
            className={({ isActive }) =>
              `${styles.saved} ${isActive ? styles.savedActive : ""}`
            }
            aria-label={`Saved stays${ids.length ? `, ${ids.length} items` : ""}`}
          >
            <Heart size={18} aria-hidden="true" />
            <span>Saved</span>
            {ids.length > 0 && <span className={styles.count}>{ids.length}</span>}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
