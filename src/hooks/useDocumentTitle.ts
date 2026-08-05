import { useEffect } from "react";

const BRAND_NAME = "SkyNature";

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | ${BRAND_NAME}`;

    return () => {
      document.title = BRAND_NAME;
    };
  }, [title]);
}
