import { useEffect } from "react";
import { useProjectData } from "../context/ProjectDataContext";

export function useDocumentTitle(title: string) {
  const { site } = useProjectData();
  useEffect(() => {
    document.title = `${title} | ${site.name}`;

    return () => {
      document.title = site.name;
    };
  }, [title, site.name]);
}
