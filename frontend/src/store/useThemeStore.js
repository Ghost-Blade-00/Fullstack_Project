import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("theme") || "dark",

  setTheme: (newTheme) => {
    // Update Zustand state
    set({ theme: newTheme });

    // Save preference
    localStorage.setItem("theme", newTheme);

    // Apply theme globally
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);

    // Update body background and text for full app coverage
    document.body.style.transition = "background-color 0.4s ease, color 0.4s ease";
    document.body.style.backgroundColor =
      newTheme === "dark" ? "#0f172a" : "#f9fafb";
    document.body.style.color = newTheme === "dark" ? "#e5e7eb" : "#1f2937";
  },
}));
