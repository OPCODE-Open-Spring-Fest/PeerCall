import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button.js";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (resolvedTheme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [resolvedTheme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    const html = document.documentElement;
    if (newTheme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    
    localStorage.setItem("peercall-theme", newTheme);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme" disabled>
        <Moon className="h-5 w-5" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark" || document.documentElement.classList.contains("dark");

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label="Toggle theme"
      type="button"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-gray-900 dark:text-gray-100" />
      ) : (
        <Moon className="h-5 w-5 text-gray-900 dark:text-gray-100" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};

export default ThemeToggle;
