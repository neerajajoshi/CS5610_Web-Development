// Theme utility

export function initTheme() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  const currentTheme = localStorage.getItem("theme");

  // Check saved preference
  if (currentTheme === "light") {
    document.body.classList.add("light-theme");
    updateToggleIcon("light");
  } else {
    document.body.classList.remove("light-theme");
    updateToggleIcon("dark");
  }

  // Listen for toggles
  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-theme");
    const theme = document.body.classList.contains("light-theme") ? "light" : "dark";
    localStorage.setItem("theme", theme);
    updateToggleIcon(theme);
  });
}

function updateToggleIcon(theme) {
  const icon = document.querySelector("#theme-toggle svg path");
  if (!icon) return;

  if (theme === "light") {
    // SVG path for moon
    icon.setAttribute("d", "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z");
  } else {
    // SVG path for sun
    icon.setAttribute(
      "d",
      "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
    );
  }
}
