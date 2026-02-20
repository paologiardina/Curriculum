// Main JavaScript extracted from index.html
document.addEventListener("DOMContentLoaded", function() {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");

  if (searchForm) {
    searchForm.addEventListener("submit", function(e) {
      e.preventDefault(); // previene il reload della pagina

      const query = searchInput.value.trim();
      if (!query) return;

      // Rimuove eventuali evidenziazioni precedenti
      document.querySelectorAll(".highlight-search").forEach(el => {
        el.outerHTML = el.innerHTML;
      });

      const elements = document.querySelectorAll("body *:not(script):not(style)");
      let firstFound = null;
      const regex = new RegExp(query, "gi"); // ricerca case-insensitive

      elements.forEach(el => {
        if (el.children.length === 0 && regex.test(el.textContent)) {
          el.innerHTML = el.textContent.replace(regex, match => `<span class="highlight-search">${match}</span>`);
          if (!firstFound) firstFound = el;
        }
      });

      // Scroll sulla prima occorrenza
      if (firstFound) {
        firstFound.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        alert("Nessuna occorrenza trovata.");
      }
    });
  }

  // BackToTop behavior
  const backToTopBtn = document.getElementById("backToTopBtn");
  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 200) { // appare dopo 200px di scroll
        backToTopBtn.style.display = "block";
      } else {
        backToTopBtn.style.display = "none";
      }
    });

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});
