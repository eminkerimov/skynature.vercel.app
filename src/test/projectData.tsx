import type { ReactNode } from "react";
import fixture from "./fixtures/project-data.json";
import { ProjectDataContext } from "../context/ProjectDataContext";
import { CompareProvider } from "../context/CompareContext";
import { ToastProvider } from "../context/ToastContext";
import { parseProjectData } from "../services/projectData";
import type { SkyNatureData } from "../types/projectData";

export const projectDocument = fixture;
export const projectData = parseProjectData(fixture);

export function ProjectDataTestProvider({
  children,
  data = projectData,
}: { children: ReactNode; data?: SkyNatureData }) {
  return (
    <ProjectDataContext.Provider value={data}>
      <ToastProvider><CompareProvider>{children}</CompareProvider></ToastProvider>
    </ProjectDataContext.Provider>
  );
}
