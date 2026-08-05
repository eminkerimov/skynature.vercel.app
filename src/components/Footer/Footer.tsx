import { ArrowUpRight, Camera, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Brand from "../Brand/Brand";
import styles from "./Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.intro}>
          <Brand inverse />
          <p>Considered stays for quieter days, closer to the wild.</p>
          <a className={styles.email} href="mailto:hello@skynature.example">
            <Mail size={17} aria-hidden="true" />
            hello@skynature.example
          </a>
        </div>
        <div className={styles.column}>
          <h2>Discover</h2>
          <Link to="/explore">All stays</Link>
          <Link to="/explore?type=Cabin">Forest cabins</Link>
          <Link to="/explore?type=Glamping">Glamping</Link>
          <Link to="/saved">Saved stays</Link>
        </div>
        <div className={styles.column}>
          <h2>SkyNature</h2>
          <Link to="/">How it works</Link>
          <Link to="/explore?rating=4.8">Guest favourites</Link>
          <a href="mailto:partners@skynature.example">List your place</a>
          <a href="mailto:help@skynature.example">Help centre</a>
        </div>
        <div className={styles.note}>
          <MapPin size={22} aria-hidden="true" />
          <p>Independent stays across eight remarkable nature regions.</p>
          <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
            <Camera size={17} aria-hidden="true" />
            Instagram
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} SkyNature</span>
        <span>Made for unhurried travel</span>
      </div>
    </footer>
  );
}
