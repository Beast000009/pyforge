import { useState, useEffect } from "react";

export interface WorkspaceLayout {
  contentWidth: number;
  labWidth: number;
  labOpen: boolean;
}

const STORAGE_PREFIX = "offsec-python-layout";

export function useWorkspaceLayout(lessonId: string) {
  const [layout, setLayout] = useState<WorkspaceLayout>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}-${lessonId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load layout:", e);
    }
    // Default: 60% content, 40% lab, lab visible
    return { contentWidth: 60, labWidth: 40, labOpen: true };
  });

  // Persist layout whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}-${lessonId}`, JSON.stringify(layout));
    } catch (e) {
      console.error("Failed to save layout:", e);
    }
  }, [layout, lessonId]);

  const setLabWidth = (width: number) => {
    // Clamp between 20% and 80%
    const clamped = Math.max(20, Math.min(80, width));
    setLayout((prev) => ({ ...prev, labWidth: clamped }));
  };

  const toggleLabOpen = () => {
    setLayout((prev) => ({ ...prev, labOpen: !prev.labOpen }));
  };

  return { layout, setLabWidth, toggleLabOpen };
}
