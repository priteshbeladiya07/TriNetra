import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

const THEME_KEY = "trinetra-theme";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(THEME_KEY) as Theme | null;
  if (saved === "dark" || saved === "light") return saved;
  // Always default to Light theme
  return "light";
}

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
  }
  localStorage.setItem(THEME_KEY, theme);
  window.dispatchEvent(new CustomEvent("trinetra:themechange", { detail: { theme } }));
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const initial = getInitialTheme();
    setThemeState(initial);
    applyTheme(initial);

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: Theme }>;
      if (customEvent.detail?.theme) {
        setThemeState(customEvent.detail.theme);
      }
    };

    window.addEventListener("trinetra:themechange", handleThemeChange);
    return () => window.removeEventListener("trinetra:themechange", handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setThemeState(next);
    applyTheme(next);
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
  };

  return { theme, toggleTheme, setTheme };
}
