import { Link } from "react-router-dom";
import { useProjectData } from "../../context/ProjectDataContext";
import styles from "./Brand.module.scss";

interface BrandProps {
  inverse?: boolean;
}

export default function Brand({ inverse = false }: BrandProps) {
  const { site } = useProjectData();

  return (
    <Link
      to="/"
      className={`${styles.brand} ${inverse ? styles.inverse : ""}`}
      aria-label={`${site.name} home`}
    >
      <svg className={styles.mark} viewBox="0 0 40 40" aria-hidden="true">
        <path d="M20 3.5c8.4 5.6 13 11.3 13 18.2 0 7.2-5.4 12.8-13 14.8-7.6-2-13-7.6-13-14.8C7 14.8 11.6 9.1 20 3.5Z" />
        <path d="M20 12v19M20 20l-6-4M20 25l7-5" />
      </svg>
      <span>{site.name}</span>
    </Link>
  );
}
