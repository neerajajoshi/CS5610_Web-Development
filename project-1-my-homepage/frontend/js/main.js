// Coordinator script
import { initTheme } from "./theme.js";
import { SmileEditor } from "./smileeditor.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();

  // Setup mobile menu menu toggle
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      menuToggle.textContent = navMenu.classList.contains("active") ? "✕" : "☰";
    });

    // Close mobile menu on click
    document.querySelectorAll(".nav-item a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuToggle.textContent = "☰";
      });
    });
  }

  // Active page highlights
  const currentPath = window.location.pathname;
  document.querySelectorAll(".nav-item").forEach((item) => {
    const link = item.querySelector("a");
    if (link) {
      const href = link.getAttribute("href");
      if (
        (href === "index.html" &&
          (currentPath.endsWith("/") || currentPath.endsWith("index.html"))) ||
        (href && currentPath.endsWith(href))
      ) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    }
  });

  // Start sandbox if the canvas is present
  if (document.getElementById("smile-canvas")) {
    new SmileEditor("smile-canvas", "smile-editor-stage");
  }

  // Category filter for projects page
  const filters = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".project-card");
  if (filters.length > 0 && cards.length > 0) {
    filters.forEach((filter) => {
      filter.addEventListener("click", (e) => {
        filters.forEach((f) => f.classList.remove("active"));
        e.target.classList.add("active");

        const category = e.target.dataset.filter;
        cards.forEach((card) => {
          if (category === "all" || card.dataset.category === category) {
            card.style.display = "flex";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }
});
