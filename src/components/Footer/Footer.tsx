import { ArrowUpRight, Camera, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Brand from "../Brand/Brand";
import { useProjectData } from "../../context/ProjectDataContext";
import styles from "./Footer.module.scss";

export default function Footer() {
  const { site, numbers, settings } = useProjectData();
  const regionCount = new Intl.NumberFormat(settings.locale).format(numbers.regions);
  const hasAboutLink = site.navigation.footer.some((group) => group.links.some((link) => link.href === "/about"));

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.intro}>
          <Brand inverse />
          <p>{site.tagline}</p>
          <a className={styles.email} href={`mailto:${site.contacts.hello}`}>
            <Mail size={17} aria-hidden="true" />
            {site.contacts.hello}
          </a>
        </div>
        {site.navigation.footer.map((group, index) => (
          <div className={styles.column} key={group.title}>
            <h2>{group.title}</h2>
            {index === site.navigation.footer.length - 1 && !hasAboutLink && (
              <Link to="/about">About {site.name}</Link>
            )}
            {group.links.map((link) =>
              link.href.startsWith("/") ? (
                <Link key={link.href} to={link.href}>{link.label}</Link>
              ) : (
                <a key={link.href} href={link.href}>{link.label}</a>
              ),
            )}
          </div>
        ))}
        <div className={styles.note}>
          <MapPin size={22} aria-hidden="true" />
          <p>Independent stays across {regionCount} remarkable nature regions.</p>
          {site.social.map((social) => (
            <a key={social.href} href={social.href} target="_blank" rel="noreferrer">
              <Camera size={17} aria-hidden="true" />
              {social.label}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} {site.name}</span>
        <span>{site.footerTagline}</span>
      </div>
    </footer>
  );
}
